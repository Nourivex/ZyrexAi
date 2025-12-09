"""Health check endpoint"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import verify_api_key
from app.config import settings
import httpx
from typing import Optional

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    backend: str
    ollama_status: str
    ollama_url: str
    primary_model: str
    database: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint - publicly accessible
    Checks backend status and Ollama connectivity
    """
    # Check Ollama connection
    ollama_status = "offline"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                ollama_status = "online"
    except Exception:
        pass
    
    return HealthResponse(
        status="ok",
        backend="online",
        ollama_status=ollama_status,
        ollama_url=settings.OLLAMA_BASE_URL,
        primary_model=settings.OLLAMA_PRIMARY_MODEL,
        database="sqlite"
    )


@router.get("/health/protected")
async def protected_health_check(api_key: str = Depends(verify_api_key)):
    """
    Protected health check - requires API key
    Returns detailed system information
    """
    return {
        "status": "ok",
        "message": "API key is valid",
        "config": {
            "max_iterations": settings.AGENT_MAX_ITERATIONS,
            "tool_timeout": settings.AGENT_TOOL_TIMEOUT,
            "upload_dir": settings.UPLOAD_DIR,
            "chromadb_path": settings.CHROMADB_PATH
        }
    }
