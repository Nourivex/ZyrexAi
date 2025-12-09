"""Documents endpoints for knowledge base management"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.security import verify_api_key
from app.services.rag import get_rag_service
from loguru import logger
import tempfile
import os

router = APIRouter()


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):
    """
    Upload and process documents into the knowledge base
    
    Supports: PDF, TXT files
    Automatically chunks and vectors content for RAG
    """
    # Validate file type
    allowed_types = ['application/pdf', 'text/plain']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only PDF and TXT files are allowed."
        )
    
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        logger.info(f"📄 Processing document: {file.filename} ({len(content)} bytes)")
        
        # Get RAG service
        rag = await get_rag_service()
        
        # Ingest document
        doc_ids = await rag.ingest_document(temp_path, file.filename)
        
        # Cleanup temp file
        os.unlink(temp_path)
        
        logger.success(f"✅ Document processed: {file.filename} → {len(doc_ids)} chunks")
        
        return {
            "success": True,
            "filename": file.filename,
            "chunks": len(doc_ids),
            "message": f"Successfully processed {file.filename} into {len(doc_ids)} chunks"
        }
    
    except Exception as e:
        logger.error(f"Failed to process document {file.filename}: {e}")
        # Cleanup temp file if exists
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.get("/documents/list")
async def list_documents(api_key: str = Depends(verify_api_key)):
    """List all documents in the knowledge base"""
    try:
        rag = await get_rag_service()
        
        # Get collection stats
        collection = rag.collection
        count = collection.count()
        
        return {
            "total_chunks": count,
            "message": f"Knowledge base contains {count} document chunks"
        }
    
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/clear")
async def clear_documents(api_key: str = Depends(verify_api_key)):
    """Clear all documents from the knowledge base"""
    try:
        rag = await get_rag_service()
        
        # Delete all from collection
        collection = rag.collection
        count = collection.count()
        
        # ChromaDB: Delete all documents
        if count > 0:
            all_ids = collection.get()['ids']
            collection.delete(ids=all_ids)
        
        logger.warning(f"🗑️ Cleared {count} chunks from knowledge base")
        
        return {
            "success": True,
            "deleted_chunks": count,
            "message": f"Cleared {count} document chunks from knowledge base"
        }
    
    except Exception as e:
        logger.error(f"Failed to clear documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))
