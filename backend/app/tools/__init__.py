"""
Tool initialization - Register all tools with their executors
"""
from app.tools.registry import get_tool_registry
from app.tools.rag_search import rag_search_tool
from app.tools.web_search import web_search_tool
from app.tools.file_reader import read_file_tool
from app.tools.system_info import system_info_tool
from loguru import logger


def initialize_tools():
    """Initialize and register all tool executors"""
    registry = get_tool_registry()
    
    # Register executors
    registry.register_executor("rag_search", rag_search_tool)
    registry.register_executor("web_search", web_search_tool)
    registry.register_executor("read_file", read_file_tool)
    registry.register_executor("system_info", system_info_tool)
    
    logger.success(f"✅ Initialized {len(registry.executors)} tool executors")


# Auto-initialize on import
initialize_tools()
