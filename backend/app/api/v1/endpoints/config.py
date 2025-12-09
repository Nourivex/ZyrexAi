"""
Configuration Management Endpoints
Allows runtime configuration updates for Ollama and other settings
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional
import os
from pathlib import Path

from app.core.security import verify_api_key
from app.config import settings

router = APIRouter()


class ConfigUpdate(BaseModel):
    """Configuration update request"""
    ollama_base_url: Optional[str] = Field(None, description="Ollama server URL")
    ollama_primary_model: Optional[str] = Field(None, description="Primary LLM model")
    ollama_fallback_model: Optional[str] = Field(None, description="Fallback LLM model")
    
    @validator('ollama_base_url')
    def validate_url(cls, v):
        if v is not None:
            if not v.startswith(('http://', 'https://')):
                raise ValueError('URL must start with http:// or https://')
        return v
    
    @validator('ollama_primary_model', 'ollama_fallback_model')
    def validate_model(cls, v):
        if v is not None:
            if not v or len(v) < 3:
                raise ValueError('Model name must be at least 3 characters')
        return v


class ConfigResponse(BaseModel):
    """Configuration response"""
    success: bool
    message: str
    current_config: dict


@router.post("/update", response_model=ConfigResponse)
async def update_config(
    config: ConfigUpdate,
    _: str = Depends(verify_api_key)
):
    """
    Update Ollama configuration at runtime
    
    This endpoint allows updating:
    - Ollama Base URL
    - Primary Model
    - Fallback Model
    
    Changes are applied immediately and persisted to .env file
    """
    try:
        updated_fields = []
        
        # Update runtime settings
        if config.ollama_base_url is not None:
            settings.OLLAMA_BASE_URL = config.ollama_base_url
            updated_fields.append("OLLAMA_BASE_URL")
        
        if config.ollama_primary_model is not None:
            settings.OLLAMA_PRIMARY_MODEL = config.ollama_primary_model
            updated_fields.append("OLLAMA_PRIMARY_MODEL")
        
        if config.ollama_fallback_model is not None:
            settings.OLLAMA_FALLBACK_MODEL = config.ollama_fallback_model
            updated_fields.append("OLLAMA_FALLBACK_MODEL")
        
        # Persist to .env file
        env_path = Path(".env")
        if env_path.exists():
            # Read existing .env
            with open(env_path, 'r') as f:
                lines = f.readlines()
            
            # Update lines
            new_lines = []
            updated_keys = set()
            
            for line in lines:
                stripped = line.strip()
                
                # Skip empty lines and comments
                if not stripped or stripped.startswith('#'):
                    new_lines.append(line)
                    continue
                
                # Check if this line contains a key we want to update
                if '=' in stripped:
                    key = stripped.split('=')[0].strip()
                    
                    if key == "OLLAMA_BASE_URL" and config.ollama_base_url is not None:
                        new_lines.append(f"OLLAMA_BASE_URL={config.ollama_base_url}\n")
                        updated_keys.add(key)
                    elif key == "OLLAMA_PRIMARY_MODEL" and config.ollama_primary_model is not None:
                        new_lines.append(f"OLLAMA_PRIMARY_MODEL={config.ollama_primary_model}\n")
                        updated_keys.add(key)
                    elif key == "OLLAMA_FALLBACK_MODEL" and config.ollama_fallback_model is not None:
                        new_lines.append(f"OLLAMA_FALLBACK_MODEL={config.ollama_fallback_model}\n")
                        updated_keys.add(key)
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            
            # Add missing keys at the end
            if "OLLAMA_BASE_URL" not in updated_keys and config.ollama_base_url is not None:
                new_lines.append(f"OLLAMA_BASE_URL={config.ollama_base_url}\n")
            if "OLLAMA_PRIMARY_MODEL" not in updated_keys and config.ollama_primary_model is not None:
                new_lines.append(f"OLLAMA_PRIMARY_MODEL={config.ollama_primary_model}\n")
            if "OLLAMA_FALLBACK_MODEL" not in updated_keys and config.ollama_fallback_model is not None:
                new_lines.append(f"OLLAMA_FALLBACK_MODEL={config.ollama_fallback_model}\n")
            
            # Write back to .env
            with open(env_path, 'w') as f:
                f.writelines(new_lines)
        else:
            # Create new .env if it doesn't exist
            with open(env_path, 'w') as f:
                f.write("# ZyrexAi Configuration\n\n")
                if config.ollama_base_url is not None:
                    f.write(f"OLLAMA_BASE_URL={config.ollama_base_url}\n")
                if config.ollama_primary_model is not None:
                    f.write(f"OLLAMA_PRIMARY_MODEL={config.ollama_primary_model}\n")
                if config.ollama_fallback_model is not None:
                    f.write(f"OLLAMA_FALLBACK_MODEL={config.ollama_fallback_model}\n")
        
        return ConfigResponse(
            success=True,
            message=f"Configuration updated successfully. Updated fields: {', '.join(updated_fields)}",
            current_config={
                "ollama_base_url": settings.OLLAMA_BASE_URL,
                "ollama_primary_model": settings.OLLAMA_PRIMARY_MODEL,
                "ollama_fallback_model": settings.OLLAMA_FALLBACK_MODEL,
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update configuration: {str(e)}"
        )


@router.get("/current", response_model=dict)
async def get_current_config(_: str = Depends(verify_api_key)):
    """
    Get current Ollama configuration
    """
    return {
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_primary_model": settings.OLLAMA_PRIMARY_MODEL,
        "ollama_fallback_model": settings.OLLAMA_FALLBACK_MODEL,
    }
