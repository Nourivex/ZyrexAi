"""
ZyrexAi Backend Entry Point
Run with: python main.py or uvicorn main:app --reload
"""
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from parent directory (project root) and current directory
project_root = Path(__file__).parent.parent
load_dotenv(project_root / ".env")  # Try project root first
load_dotenv()  # Then current directory (overrides if exists)

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 1810))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
