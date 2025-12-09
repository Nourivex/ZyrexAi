"""Tool endpoints for listing and executing tools directly"""
from fastapi import APIRouter, Depends
from app.core.security import verify_api_key
from app.models.schemas import ToolExecuteRequest, ToolExecuteResponse, ToolDefinition
from app.tools.registry import get_tool_registry
from loguru import logger
import time

router = APIRouter()


@router.get("/", response_model=list[ToolDefinition])
async def list_tools(api_key: str = Depends(verify_api_key)):
    """Get all available tools"""
    registry = get_tool_registry()
    tools = registry.get_all_tools()
    
    # Convert to ToolDefinition format
    tool_defs = []
    for tool in tools:
        tool_defs.append(ToolDefinition(
            name=tool["name"],
            display_name=tool["display_name"],
            description=tool["description"],
            category=tool["category"],
            parameters=tool["parameters"],
            is_enabled=True  # All registered tools are enabled
        ))
    
    return tool_defs


@router.post("/execute", response_model=ToolExecuteResponse)
async def execute_tool(
    request: ToolExecuteRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute a tool directly"""
    registry = get_tool_registry()
    
    logger.info(f"Direct tool execution: {request.tool_name}")
    
    start_time = time.time()
    result = await registry.execute_tool(
        name=request.tool_name,
        parameters=request.parameters
    )
    execution_time = time.time() - start_time
    
    return ToolExecuteResponse(
        tool_name=request.tool_name,
        result=result.get("result"),
        success=result.get("success", False),
        error=result.get("error"),
        execution_time=round(execution_time, 3)
    )
