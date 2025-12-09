"""
RAG Service - Document ingestion and retrieval
Combines SQLite metadata with ChromaDB vector search
"""
from typing import List, Dict, Any, Optional
from pathlib import Path
from loguru import logger
from sqlmodel import select
from app.models.database import Document, DocumentChunk, async_session
from app.services.chromadb import get_chroma_service
from app.services.ollama import get_ollama_service
import re


class RAGService:
    """RAG pipeline service for document ingestion and retrieval"""
    
    def __init__(self):
        self.chroma = get_chroma_service()
    
    def _chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        overlap: int = 50
    ) -> List[str]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Text to chunk
            chunk_size: Target chunk size in characters
            overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < text_len:
                # Look for sentence endings
                for pattern in ['\n\n', '\n', '. ', '! ', '? ', '; ']:
                    last_break = text.rfind(pattern, start, end)
                    if last_break != -1:
                        end = last_break + len(pattern)
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
        
        return chunks
    
    async def ingest_file(
        self,
        file_path: str,
        title: Optional[str] = None
    ) -> int:
        """
        Ingest a file into RAG pipeline
        
        Args:
            file_path: Path to file
            title: Optional title (defaults to filename)
            
        Returns:
            Document ID
        """
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Read file
        try:
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(path, 'r', encoding='latin-1') as f:
                text = f.read()
        
        if not title:
            title = path.name
        
        logger.info(f"Ingesting file: {title} ({len(text)} chars)")
        
        async with async_session() as session:
            # Create document record
            document = Document(
                title=title,
                file_path=str(path.absolute()),
                file_type=path.suffix,
                file_size=path.stat().st_size,
                is_processed=False
            )
            
            session.add(document)
            await session.commit()
            await session.refresh(document)
            
            # Chunk text
            chunks = self._chunk_text(text)
            logger.info(f"Created {len(chunks)} chunks")
            
            # Create chunk records
            chunk_records = []
            chroma_docs = []
            chroma_metas = []
            chroma_ids = []
            
            for i, chunk_text in enumerate(chunks):
                chunk_id = f"doc_{document.id}_chunk_{i}"
                
                chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=i,
                    chunk_text=chunk_text,
                    chroma_id=chunk_id,
                    token_count=len(chunk_text.split())
                )
                
                session.add(chunk)
                chunk_records.append(chunk)
                
                # Prepare for ChromaDB
                chroma_docs.append(chunk_text)
                chroma_metas.append({
                    "doc_id": document.id,
                    "chunk_index": i,
                    "document_title": title,
                    "file_type": path.suffix
                })
                chroma_ids.append(chunk_id)
            
            await session.commit()
            
            # Add to ChromaDB
            success = await self.chroma.add_documents(
                documents=chroma_docs,
                metadatas=chroma_metas,
                ids=chroma_ids
            )
            
            if success:
                document.is_processed = True
                session.add(document)
                await session.commit()
                logger.success(f"✅ Document {document.id} ingested successfully")
            else:
                logger.error(f"Failed to add document to ChromaDB")
            
            return document.id
    
    async def search(
        self,
        query: str,
        top_k: int = 5,
        document_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Search documents using RAG
        
        Args:
            query: Search query
            top_k: Number of results
            document_id: Optional filter by document ID
            
        Returns:
            List of search results with metadata
        """
        # Build filter
        where = None
        if document_id:
            where = {"doc_id": document_id}
        
        # Search ChromaDB
        results = await self.chroma.search(
            query=query,
            n_results=top_k,
            where=where
        )
        
        # Format results
        formatted = []
        
        if results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted.append({
                    "chunk_text": doc,
                    "metadata": results["metadatas"][0][i],
                    "similarity_score": 1 - results["distances"][0][i],  # Convert distance to similarity
                    "document_title": results["metadatas"][0][i].get("document_title", "Unknown"),
                    "document_id": results["metadatas"][0][i].get("doc_id", 0)
                })
        
        return formatted
    
    async def generate_answer(
        self,
        question: str,
        context_results: List[Dict[str, Any]],
        model: Optional[str] = None
    ) -> str:
        """
        Generate answer using RAG context
        
        Args:
            question: User question
            context_results: Search results from RAG
            model: Optional model override
            
        Returns:
            Generated answer
        """
        # Build context
        context_parts = []
        for result in context_results:
            source = result.get("document_title", "Unknown")
            text = result.get("chunk_text", "")
            context_parts.append(f"[Source: {source}]\n{text}")
        
        context = "\n\n".join(context_parts)
        
        # Build prompt
        prompt = f"""Based on the following context, answer the question. If the context doesn't contain enough information, say so honestly.

Context:
{context}

Question: {question}

Answer:"""
        
        system = "You are a helpful assistant. Answer questions based on the provided context. Be concise and accurate. Cite sources when relevant."
        
        # Generate answer
        ollama = await get_ollama_service()
        result = await ollama.generate(
            prompt=prompt,
            system=system,
            model=model,
            temperature=0.3  # Lower temperature for factual answers
        )
        
        return result.get("response", "I couldn't generate an answer.")
    
    async def delete_document(self, document_id: int) -> bool:
        """
        Delete document and all its chunks
        
        Args:
            document_id: Document ID
            
        Returns:
            Success boolean
        """
        async with async_session() as session:
            # Get document
            result = await session.exec(
                select(Document).where(Document.id == document_id)
            )
            document = result.first()
            
            if not document:
                logger.warning(f"Document {document_id} not found")
                return False
            
            # Delete from ChromaDB
            await self.chroma.delete_document(document_id)
            
            # Delete from SQLite (cascades to chunks)
            await session.delete(document)
            await session.commit()
            
            logger.success(f"Deleted document {document_id}")
            return True


# Global service instance
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    """Get or create RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
