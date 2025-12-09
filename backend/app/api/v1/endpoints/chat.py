"""Chat endpoints for default chat functionality"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import select
from typing import AsyncGenerator
from app.core.security import verify_api_key
from app.models.schemas import ChatRequest, ChatResponse
from app.models.database import Session, Message, async_session
from app.services.ollama import get_ollama_service
from loguru import logger
import json

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Non-streaming chat endpoint
    """
    ollama = await get_ollama_service()
    
    async with async_session() as session:
        # Get or create session
        if request.session_id:
            result = await session.execute(
                select(Session).where(Session.id == request.session_id)
            )
            chat_session = result.scalars().first()
            if not chat_session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            chat_session = Session(title=request.message[:50])
            session.add(chat_session)
            await session.commit()
            await session.refresh(chat_session)
        
        # Get conversation history
        result = await session.execute(
            select(Message)
            .where(Message.session_id == chat_session.id)
            .order_by(Message.created_at)
        )
        history = result.scalars().all()
        
        # Build messages
        messages = [{"role": msg.role, "content": msg.content} for msg in history]
        messages.append({"role": "user", "content": request.message})
        
        # Save user message
        user_msg = Message(
            session_id=chat_session.id,
            role="user",
            content=request.message
        )
        session.add(user_msg)
        
        # Generate response
        response = await ollama.chat(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            stream=False
        )
        
        assistant_content = response["message"]["content"]
        
        # Save assistant message
        assistant_msg = Message(
            session_id=chat_session.id,
            role="assistant",
            content=assistant_content
        )
        session.add(assistant_msg)
        await session.commit()
        await session.refresh(assistant_msg)
        
        return ChatResponse(
            message=assistant_content,
            session_id=chat_session.id,
            message_id=assistant_msg.id,
            model_used=request.model or ollama.primary_model
        )


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Streaming chat endpoint using Server-Sent Events
    """
    async def generate() -> AsyncGenerator[str, None]:
        ollama = await get_ollama_service()
        
        async with async_session() as session:
            # Get or create session
            if request.session_id:
                result = await session.execute(
                    select(Session).where(Session.id == request.session_id)
                )
                chat_session = result.scalars().first()
                if not chat_session:
                    yield f"data: {json.dumps({'error': 'Session not found'})}\n\n"
                    return
            else:
                chat_session = Session(title=request.message[:50])
                session.add(chat_session)
                await session.commit()
                await session.refresh(chat_session)
            
            # Send session ID first
            yield f"data: {json.dumps({'session_id': chat_session.id, 'type': 'session'})}\n\n"
            
            # Get history
            result = await session.execute(
                select(Message)
                .where(Message.session_id == chat_session.id)
                .order_by(Message.created_at)
            )
            history = result.scalars().all()
            
            messages = [{"role": msg.role, "content": msg.content} for msg in history]
            messages.append({"role": "user", "content": request.message})
            
            # Save user message
            user_msg = Message(
                session_id=chat_session.id,
                role="user",
                content=request.message
            )
            session.add(user_msg)
            await session.commit()
            
            # Stream response
            full_response = ""
            async for chunk in ollama.chat(
                messages=messages,
                model=request.model,
                temperature=request.temperature,
                stream=True
            ):
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'type': 'chunk'})}\n\n"
            
            # Save assistant message
            assistant_msg = Message(
                session_id=chat_session.id,
                role="assistant",
                content=full_response
            )
            session.add(assistant_msg)
            await session.commit()
            
            # Send done
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/sessions")
async def list_sessions(api_key: str = Depends(verify_api_key)):
    """List all chat sessions"""
    async with async_session() as session:
        result = await session.execute(select(Session).order_by(Session.updated_at.desc()))
        sessions = result.scalars().all()
        return {"sessions": sessions}


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Get messages for a session"""
    async with async_session() as session:
        result = await session.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at)
        )
        messages = result.scalars().all()
        return {"messages": messages}


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Delete a session"""
    async with async_session() as session:
        result = await session.execute(select(Session).where(Session.id == session_id))
        chat_session = result.scalars().first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        await session.delete(chat_session)
        await session.commit()
        return {"message": "Session deleted"}
