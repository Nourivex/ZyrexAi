"""
ChromaDB Service - Vector database for RAG
Handles document embeddings and semantic search
"""
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from typing import List, Dict, Any, Optional
from loguru import logger
from app.config import settings
import os


class ChromaDBService:
    """Service for ChromaDB vector database operations"""
    
    def __init__(self):
        # Create ChromaDB directory if it doesn't exist
        os.makedirs(settings.CHROMADB_PATH, exist_ok=True)
        
        # Initialize persistent client
        self.client = chromadb.PersistentClient(
            path=settings.CHROMADB_PATH,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Setup embedding function (all-MiniLM-L6-v2)
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="documents",
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine"}  # Cosine similarity
        )
        
        logger.info("ChromaDB initialized successfully")
    
    async def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ) -> bool:
        """
        Add documents to ChromaDB collection
        
        Args:
            documents: List of text chunks
            metadatas: List of metadata dicts for each chunk
            ids: List of unique IDs for each chunk
            
        Returns:
            Success boolean
        """
        try:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            logger.success(f"Added {len(documents)} documents to ChromaDB")
            return True
        except Exception as e:
            logger.error(f"Failed to add documents to ChromaDB: {e}")
            return False
    
    async def search(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Semantic search in ChromaDB
        
        Args:
            query: Search query
            n_results: Number of results to return
            where: Metadata filter (e.g., {"doc_id": 5})
            
        Returns:
            Search results with documents, metadatas, and distances
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )
            
            logger.info(f"Found {len(results['documents'][0])} results for query")
            return results
        except Exception as e:
            logger.error(f"ChromaDB search error: {e}")
            return {
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]]
            }
    
    async def delete_document(self, document_id: int) -> bool:
        """
        Delete all chunks for a document
        
        Args:
            document_id: Document ID from SQLite
            
        Returns:
            Success boolean
        """
        try:
            # Delete by metadata filter
            self.collection.delete(
                where={"doc_id": document_id}
            )
            logger.success(f"Deleted document {document_id} from ChromaDB")
            return True
        except Exception as e:
            logger.error(f"Failed to delete document from ChromaDB: {e}")
            return False
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get ChromaDB collection statistics
        
        Returns:
            Dict with collection stats
        """
        try:
            count = self.collection.count()
            return {
                "collection_name": self.collection.name,
                "total_documents": count,
                "embedding_model": "all-MiniLM-L6-v2",
                "distance_metric": "cosine"
            }
        except Exception as e:
            logger.error(f"Failed to get ChromaDB stats: {e}")
            return {
                "collection_name": "documents",
                "total_documents": 0,
                "error": str(e)
            }
    
    async def reset_collection(self) -> bool:
        """
        Delete and recreate collection (for testing/reset)
        
        Returns:
            Success boolean
        """
        try:
            self.client.delete_collection(name="documents")
            self.collection = self.client.create_collection(
                name="documents",
                embedding_function=self.embedding_function,
                metadata={"hnsw:space": "cosine"}
            )
            logger.warning("ChromaDB collection reset")
            return True
        except Exception as e:
            logger.error(f"Failed to reset ChromaDB collection: {e}")
            return False


# Global service instance
_chroma_service: Optional[ChromaDBService] = None


def get_chroma_service() -> ChromaDBService:
    """Get or create ChromaDB service instance"""
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaDBService()
    return _chroma_service
