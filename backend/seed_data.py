"""
Seed database with default characters and tools
Run with: python seed_data.py
"""
import asyncio
from sqlmodel import select
from app.models.database import (
    async_session,
    init_db,
    Character,
    Tool
)
from loguru import logger
import json


async def seed_characters():
    """Seed default roleplay characters"""
    async with async_session() as session:
        # Check if characters already exist
        result = await session.execute(select(Character))
        existing = result.scalars().all()
        
        if len(existing) > 0:
            logger.info(f"Characters already seeded ({len(existing)} found). Skipping...")
            return
        
        logger.info("Seeding default characters...")
        
        characters = [
            Character(
                name="Assistant",
                description="Helpful general-purpose AI assistant",
                system_prompt="""You are a helpful, friendly, and knowledgeable AI assistant. 
You provide clear, accurate, and concise answers. You're polite, professional, and aim to be helpful in any task.
When you don't know something, you admit it honestly. You can help with a wide variety of tasks including 
answering questions, creative writing, coding, analysis, and more.""",
                temperature=0.7,
                avatar_path=None
            ),
            Character(
                name="Coder",
                description="Expert programming assistant specialized in code",
                system_prompt="""You are an expert programming assistant with deep knowledge of multiple programming languages,
frameworks, algorithms, and software engineering best practices. You provide clean, efficient, well-documented code.
You explain complex concepts clearly, debug issues methodically, and suggest improvements. You're particularly skilled 
at Python, JavaScript, TypeScript, and systems programming. You always follow best practices and write production-ready code.""",
                temperature=0.3,
                model_preference="qwen2.5-coder:14b",
                avatar_path=None
            ),
            Character(
                name="Storyteller",
                description="Creative writer for stories and narratives",
                system_prompt="""You are a creative storyteller with a gift for engaging narratives, rich descriptions,
and compelling characters. You can write in various genres - fantasy, sci-fi, mystery, romance, and more.
Your stories are vivid, emotionally resonant, and keep readers engaged. You understand story structure, 
character development, and how to create tension and resolution. You adapt your writing style to match the requested genre.""",
                temperature=0.9,
                avatar_path=None
            )
        ]
        
        for char in characters:
            session.add(char)
            logger.info(f"Added character: {char.name}")
        
        await session.commit()
        logger.success("✅ Characters seeded successfully!")


async def seed_tools():
    """Seed default tool definitions"""
    async with async_session() as session:
        # Check if tools already exist
        result = await session.execute(select(Tool))
        existing = result.scalars().all()
        
        if len(existing) > 0:
            logger.info(f"Tools already seeded ({len(existing)} found). Skipping...")
            return
        
        logger.info("Seeding default tools...")
        
        tools = [
            Tool(
                name="rag_search",
                display_name="RAG Search",
                description="Search through uploaded documents for relevant information",
                category="search",
                parameters_schema=json.dumps({
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of results to return",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }),
                is_enabled=True
            ),
            Tool(
                name="web_search",
                display_name="Web Search",
                description="Search the internet using DuckDuckGo",
                category="search",
                parameters_schema=json.dumps({
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum number of results",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }),
                is_enabled=True
            ),
            Tool(
                name="read_file",
                display_name="File Reader",
                description="Read contents of a local file",
                category="file",
                parameters_schema=json.dumps({
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Path to the file to read"
                        }
                    },
                    "required": ["file_path"]
                }),
                is_enabled=True
            ),
            Tool(
                name="system_info",
                display_name="System Info",
                description="Get system information (time, date, system stats)",
                category="system",
                parameters_schema=json.dumps({
                    "type": "object",
                    "properties": {
                        "info_type": {
                            "type": "string",
                            "enum": ["time", "date", "datetime", "cpu", "memory", "disk", "all"],
                            "description": "Type of information to retrieve"
                        }
                    },
                    "required": ["info_type"]
                }),
                is_enabled=True
            )
        ]
        
        for tool in tools:
            session.add(tool)
            logger.info(f"Added tool: {tool.display_name}")
        
        await session.commit()
        logger.success("✅ Tools seeded successfully!")


async def main():
    """Main seeding function"""
    logger.info("Starting database seeding...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Seed data
    await seed_characters()
    await seed_tools()
    
    logger.success("🎉 Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
