"""
ZyrexAi Configuration Module
Loads environment variables and provides application settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Security
    API_KEY: str = "dev-secret-key-change-in-production"
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_PRIMARY_MODEL: str = "qwen2.5-coder:14b-instruct"
    OLLAMA_FALLBACK_MODEL: str = "llama3.1:8b"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/zyrex.db"
    
    # ChromaDB
    CHROMADB_PATH: str = "./data/chromadb"
    
    # Server Configuration
    BACKEND_PORT: int = 1810
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_UPLOAD_EXTENSIONS: str = ".txt,.md,.py,.pdf,.docx"
    UPLOAD_DIR: str = "./data/uploads"
    
    # Agent Configuration
    AGENT_MAX_ITERATIONS: int = 10
    AGENT_TOOL_TIMEOUT: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        """Get list of allowed file extensions"""
        return [ext.strip() for ext in self.ALLOWED_UPLOAD_EXTENSIONS.split(",")]


# Global settings instance
settings = Settings()
