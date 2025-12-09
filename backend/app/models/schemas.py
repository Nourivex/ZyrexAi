"""
Pydantic schemas for request/response validation
Separate from database models for API flexibility
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Chat Schemas
class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Message role: user, assistant, system")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Chat request payload"""
    message: str = Field(..., description="User message")
    session_id: Optional[int] = Field(None, description="Session ID for conversation context")
    model: Optional[str] = Field(None, description="Override default model")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    stream: bool = Field(False, description="Enable streaming response")


class ChatResponse(BaseModel):
    """Chat response payload"""
    model_config = {"protected_namespaces": ()}
    
    message: str
    session_id: int
    message_id: int
    model_used: str
    metadata: Optional[Dict[str, Any]] = None


# Character/Roleplay Schemas
class CharacterCreate(BaseModel):
    """Create new character"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=500)
    system_prompt: str = Field(..., description="Character personality and instructions")
    avatar_path: Optional[str] = None
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    model_preference: Optional[str] = None


class CharacterUpdate(BaseModel):
    """Update existing character"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = None
    avatar_path: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    model_preference: Optional[str] = None


class CharacterResponse(BaseModel):
    """Character response"""
    id: int
    name: str
    description: str
    system_prompt: str
    avatar_path: Optional[str]
    temperature: float
    model_preference: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoleplayRequest(BaseModel):
    """Roleplay chat request"""
    character_id: int
    message: str
    session_id: Optional[int] = None
    stream: bool = False


# Agent Schemas
class AgentCreate(BaseModel):
    """Create new agent"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., max_length=500)
    model_name: str = Field("qwen2.5-coder:14b")
    system_prompt: str
    tools_enabled: List[str] = Field(default_factory=list)
    max_iterations: int = Field(10, ge=1, le=50)


class AgentUpdate(BaseModel):
    """Update existing agent"""
    name: Optional[str] = None
    description: Optional[str] = None
    model_name: Optional[str] = None
    system_prompt: Optional[str] = None
    tools_enabled: Optional[List[str]] = None
    is_active: Optional[bool] = None
    max_iterations: Optional[int] = None


class AgentResponse(BaseModel):
    """Agent response"""
    id: int
    name: str
    description: str
    model_name: str
    system_prompt: str
    tools_enabled: List[str]
    is_active: bool
    max_iterations: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class AgentExecuteRequest(BaseModel):
    """Execute agent task"""
    task: str = Field(..., description="Task description for agent")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class AgentExecutionStep(BaseModel):
    """Single step in agent execution"""
    step_number: int
    thought: str
    action: str
    action_input: Dict[str, Any]
    observation: str


class AgentExecuteResponse(BaseModel):
    """Agent execution result"""
    result: str
    steps: List[AgentExecutionStep]
    success: bool
    error: Optional[str] = None


# Automation Schemas
class AutomationCreate(BaseModel):
    """Create new automation"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    cron_expression: str = Field(..., description="Cron format: '0 7 * * *'")
    agent_id: Optional[int] = None
    action_type: str = Field(..., description="agent_task, rag_query, notification")
    action_config: Dict[str, Any] = Field(..., description="Action configuration")


class AutomationUpdate(BaseModel):
    """Update automation"""
    name: Optional[str] = None
    description: Optional[str] = None
    cron_expression: Optional[str] = None
    agent_id: Optional[int] = None
    action_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AutomationResponse(BaseModel):
    """Automation response"""
    id: int
    name: str
    description: str
    cron_expression: str
    agent_id: Optional[int]
    action_type: str
    action_config: Dict[str, Any]
    is_active: bool
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Tool Schemas
class ToolExecuteRequest(BaseModel):
    """Execute tool directly"""
    tool_name: str
    parameters: Dict[str, Any]


class ToolExecuteResponse(BaseModel):
    """Tool execution result"""
    tool_name: str
    result: Any
    success: bool
    error: Optional[str] = None
    execution_time: float


class ToolDefinition(BaseModel):
    """Tool definition for function calling"""
    name: str
    display_name: str
    description: str
    category: str
    parameters: Dict[str, Any]
    is_enabled: bool


# Document/RAG Schemas
class DocumentUploadResponse(BaseModel):
    """Document upload result"""
    document_id: int
    filename: str
    file_size: int
    chunks_created: int
    message: str


class RAGSearchRequest(BaseModel):
    """RAG search request"""
    query: str
    top_k: int = Field(5, ge=1, le=20)
    filter: Optional[Dict[str, Any]] = None


class RAGSearchResult(BaseModel):
    """Single RAG search result"""
    chunk_text: str
    document_title: str
    document_id: int
    similarity_score: float
    metadata: Dict[str, Any]


class RAGSearchResponse(BaseModel):
    """RAG search response"""
    query: str
    results: List[RAGSearchResult]
    total_found: int
