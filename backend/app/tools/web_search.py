"""
Web Search Tool - Search internet using DuckDuckGo
"""
from typing import List, Dict, Any
from loguru import logger
from duckduckgo_search import DDGS


async def web_search_tool(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search the web using DuckDuckGo
    
    Args:
        query: Search query
        max_results: Maximum number of results
        
    Returns:
        List of search results
    """
    logger.info(f"Web search: '{query}' (max_results={max_results})")
    
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        
        # Format results
        formatted = []
        for result in results:
            formatted.append({
                "title": result.get("title", ""),
                "url": result.get("href", ""),
                "snippet": result.get("body", "")
            })
        
        logger.success(f"Found {len(formatted)} web results")
        return formatted
    
    except Exception as e:
        logger.error(f"Web search error: {e}")
        return [{
            "error": f"Web search failed: {str(e)}"
        }]
