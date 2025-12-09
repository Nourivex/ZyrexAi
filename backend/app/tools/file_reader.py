"""
File Reader Tool - Read local files with security checks
"""
from pathlib import Path
from loguru import logger
from app.config import settings


# Allowed directories for file reading
ALLOWED_DIRECTORIES = [
    settings.UPLOAD_DIR,
    "./data/uploads",
    "./documents"
]


async def read_file_tool(file_path: str) -> str:
    """
    Read contents of a local file
    
    Args:
        file_path: Path to file
        
    Returns:
        File contents as string
    """
    logger.info(f"Reading file: {file_path}")
    
    path = Path(file_path)
    
    # Security: Check if path is in allowed directories
    is_allowed = False
    try:
        resolved_path = path.resolve()
        for allowed_dir in ALLOWED_DIRECTORIES:
            allowed_path = Path(allowed_dir).resolve()
            if resolved_path.is_relative_to(allowed_path):
                is_allowed = True
                break
    except Exception:
        pass
    
    if not is_allowed:
        logger.warning(f"File access denied: {file_path}")
        return f"Error: File access denied. File must be in one of these directories: {', '.join(ALLOWED_DIRECTORIES)}"
    
    # Check if file exists
    if not path.exists():
        logger.warning(f"File not found: {file_path}")
        return f"Error: File not found: {file_path}"
    
    # Check if it's a file
    if not path.is_file():
        return f"Error: Path is not a file: {file_path}"
    
    # Check file extension
    if path.suffix not in settings.allowed_extensions_list:
        return f"Error: File type '{path.suffix}' not allowed. Allowed: {', '.join(settings.allowed_extensions_list)}"
    
    # Read file
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        logger.success(f"Read {len(content)} characters from {path.name}")
        
        # Limit content size
        max_chars = 10000
        if len(content) > max_chars:
            content = content[:max_chars] + f"\n\n[... truncated, file has {len(content)} total characters]"
        
        return content
    
    except UnicodeDecodeError:
        try:
            with open(path, 'r', encoding='latin-1') as f:
                content = f.read()
            return content[:10000]
        except Exception as e:
            logger.error(f"Failed to read file: {e}")
            return f"Error: Failed to read file: {str(e)}"
    
    except Exception as e:
        logger.error(f"File read error: {e}")
        return f"Error: {str(e)}"
