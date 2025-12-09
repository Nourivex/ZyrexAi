"""
Database connection and initialization
SQLModel tables and async engine setup
"""
from sqlmodel import SQLModel, create_engine, Field, Relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Optional, List
from datetime import datetime
from app.config import settings
import json

# Async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False}
)

# Async session maker
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


# Database Models
class Character(SQLModel, table=True):
    """Roleplay character with personality configuration"""
    __tablename__ = "characters"
    
    model_config = {"protected_namespaces": ()}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    system_prompt: str  # Core personality/instructions
    avatar_path: Optional[str] = None
    temperature: float = Field(default=0.7)
    model_preference: Optional[str] = None  # Override default model
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    sessions: List["Session"] = Relationship(back_populates="character")


class Agent(SQLModel, table=True):
    """Autonomous agent with tool access"""
    __tablename__ = "agents"
    
    model_config = {"protected_namespaces": ()}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    model_name: str = Field(default="qwen2.5-coder:14b")
    system_prompt: str
    tools_enabled: str = Field(default="[]")  # JSON array of tool names
    is_active: bool = Field(default=True)
    max_iterations: int = Field(default=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    sessions: List["Session"] = Relationship(back_populates="agent")
    
    @property
    def tools_list(self) -> List[str]:
        """Get tools as Python list"""
        return json.loads(self.tools_enabled)
    
    def set_tools(self, tools: List[str]):
        """Set tools from Python list"""
        self.tools_enabled = json.dumps(tools)


class Session(SQLModel, table=True):
    """Chat session/conversation"""
    __tablename__ = "sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(default="New Conversation")
    agent_id: Optional[int] = Field(default=None, foreign_key="agents.id")
    character_id: Optional[int] = Field(default=None, foreign_key="characters.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    agent: Optional[Agent] = Relationship(back_populates="sessions")
    character: Optional[Character] = Relationship(back_populates="sessions")
    messages: List["Message"] = Relationship(back_populates="session", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class Message(SQLModel, table=True):
    """Individual message in a session"""
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="sessions.id", index=True)
    role: str  # 'user', 'assistant', 'system', 'tool'
    content: str
    message_metadata: Optional[str] = Field(default=None)  # JSON: tool calls, sources, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Session = Relationship(back_populates="messages")
    
    @property
    def metadata_dict(self) -> dict:
        """Get metadata as Python dict"""
        return json.loads(self.message_metadata) if self.message_metadata else {}
    
    def set_metadata(self, data: dict):
        """Set metadata from Python dict"""
        self.message_metadata = json.dumps(data)


class Document(SQLModel, table=True):
    """Uploaded document for RAG"""
    __tablename__ = "documents"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    file_path: str
    file_type: str
    file_size: int
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    is_processed: bool = Field(default=False)
    
    # Relationships
    chunks: List["DocumentChunk"] = Relationship(back_populates="document", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class DocumentChunk(SQLModel, table=True):
    """Text chunk from document with vector embedding"""
    __tablename__ = "document_chunks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="documents.id", index=True)
    chunk_index: int
    chunk_text: str
    chroma_id: str = Field(index=True)  # Link to ChromaDB
    token_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    document: Document = Relationship(back_populates="chunks")


class Automation(SQLModel, table=True):
    """Scheduled automation/task"""
    __tablename__ = "automations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    cron_expression: str  # Cron format: "0 7 * * *"
    agent_id: Optional[int] = Field(default=None, foreign_key="agents.id")
    action_type: str  # 'agent_task', 'rag_query', 'notification'
    action_config: str  # JSON configuration
    is_active: bool = Field(default=True)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @property
    def config_dict(self) -> dict:
        """Get action config as Python dict"""
        return json.loads(self.action_config)
    
    def set_config(self, config: dict):
        """Set action config from Python dict"""
        self.action_config = json.dumps(config)


class Tool(SQLModel, table=True):
    """Tool definition for agents"""
    __tablename__ = "tools"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    display_name: str
    description: str
    category: str  # 'search', 'file', 'system', 'custom'
    parameters_schema: str  # JSON schema
    is_enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @property
    def parameters(self) -> dict:
        """Get parameters schema as Python dict"""
        return json.loads(self.parameters_schema)
    
    def set_parameters(self, schema: dict):
        """Set parameters schema from Python dict"""
        self.parameters_schema = json.dumps(schema)


async def init_db():
    """Initialize database - create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session():
    """Get database session for dependency injection"""
    async with async_session() as session:
        yield session
