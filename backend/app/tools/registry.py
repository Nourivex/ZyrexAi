"""
Tool Registry - Central registry for all agent tools
Defines tool schemas and mappings
"""
from typing import Dict, Any, List, Callable
from loguru import logger
import json


# Tool schemas following OpenAI function calling format
TOOL_DEFINITIONS = [
    {
        "name": "rag_search",
        "display_name": "RAG Search",
        "description": "Search through uploaded documents for relevant information using semantic search",
        "category": "search",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query to find relevant information"
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of results to return (default: 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "web_search",
        "display_name": "Web Search",
        "description": "Search the internet using DuckDuckGo for current information",
        "category": "search",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results (default: 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "read_file",
        "display_name": "File Reader",
        "description": "Read contents of a local file from allowed directories",
        "category": "file",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path to the file to read (must be in allowed directories)"
                }
            },
            "required": ["file_path"]
        }
    },
    {
        "name": "system_info",
        "display_name": "System Info",
        "description": "Get current system information like time, date, CPU, memory usage",
        "category": "system",
        "parameters": {
            "type": "object",
            "properties": {
                "info_type": {
                    "type": "string",
                    "enum": ["time", "date", "datetime", "cpu", "memory", "disk", "all"],
                    "description": "Type of system information to retrieve"
                }
            },
            "required": ["info_type"]
        }
    }
]


class ToolRegistry:
    """Registry for managing agent tools"""
    
    def __init__(self):
        self.tools: Dict[str, Dict[str, Any]] = {}
        self.executors: Dict[str, Callable] = {}
        self._register_default_tools()
    
    def _register_default_tools(self):
        """Register all default tools"""
        for tool in TOOL_DEFINITIONS:
            self.register_tool(tool)
    
    def register_tool(self, tool_def: Dict[str, Any]):
        """
        Register a tool definition
        
        Args:
            tool_def: Tool definition dict
        """
        name = tool_def["name"]
        self.tools[name] = tool_def
        logger.info(f"Registered tool: {name}")
    
    def register_executor(self, name: str, executor: Callable):
        """
        Register tool executor function
        
        Args:
            name: Tool name
            executor: Async function to execute tool
        """
        self.executors[name] = executor
        logger.info(f"Registered executor for: {name}")
    
    def get_tool(self, name: str) -> Dict[str, Any]:
        """Get tool definition by name"""
        return self.tools.get(name)
    
    def get_all_tools(self) -> List[Dict[str, Any]]:
        """Get all registered tools"""
        return list(self.tools.values())
    
    def get_tools_for_prompt(self, tool_names: List[str] = None) -> str:
        """
        Get tool descriptions formatted for LLM prompt
        
        Args:
            tool_names: Specific tools to include (None = all)
            
        Returns:
            Formatted tool descriptions
        """
        if tool_names:
            tools = [self.tools[name] for name in tool_names if name in self.tools]
        else:
            tools = list(self.tools.values())
        
        descriptions = []
        for tool in tools:
            params = tool["parameters"]["properties"]
            param_desc = ", ".join([
                f"{name}: {props.get('description', '')}"
                for name, props in params.items()
            ])
            descriptions.append(
                f"- {tool['name']}: {tool['description']}\n  Parameters: {param_desc}"
            )
        
        return "\n".join(descriptions)
    
    async def execute_tool(
        self,
        name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a tool
        
        Args:
            name: Tool name
            parameters: Tool parameters
            
        Returns:
            Execution result
        """
        if name not in self.executors:
            return {
                "success": False,
                "error": f"Tool '{name}' has no executor registered"
            }
        
        try:
            executor = self.executors[name]
            result = await executor(**parameters)
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            logger.error(f"Tool execution error ({name}): {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Global registry instance
_tool_registry: ToolRegistry = None


def get_tool_registry() -> ToolRegistry:
    """Get or create tool registry instance"""
    global _tool_registry
    if _tool_registry is None:
        _tool_registry = ToolRegistry()
    return _tool_registry
