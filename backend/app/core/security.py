"""Security utilities for API authentication"""
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from app.config import settings

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Verify API key from request header
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        Verified API key
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing API Key. Include X-API-Key header."
        )
    
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )
    
    return api_key
