"""
RAG Search Tool - Search through uploaded documents
"""
from typing import Any, Dict, List
from loguru import logger
from app.services.rag import get_rag_service


async def rag_search_tool(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search through uploaded documents using RAG
    
    Args:
        query: Search query
        top_k: Number of results to return
        
    Returns:
        List of relevant document chunks
    """
    logger.info(f"RAG search: '{query}' (top_k={top_k})")
    
    rag_service = get_rag_service()
    results = await rag_service.search(query=query, top_k=top_k)
    
    # Format results for agent
    formatted = []
    for result in results:
        formatted.append({
            "text": result["chunk_text"],
            "source": result["document_title"],
            "similarity": round(result["similarity_score"], 3)
        })
    
    logger.success(f"Found {len(formatted)} results")
    return formatted
