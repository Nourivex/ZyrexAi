"""Roleplay endpoints for character-based conversations"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import select
from typing import AsyncGenerator
from app.core.security import verify_api_key
from app.models.schemas import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    RoleplayRequest
)
from app.models.database import Character, Session, Message, async_session
from app.services.ollama import get_ollama_service
from loguru import logger
import json

router = APIRouter()


@router.get("/characters", response_model=list[CharacterResponse])
async def list_characters(api_key: str = Depends(verify_api_key)):
    """Get all characters"""
    async with async_session() as session:
        result = await session.execute(select(Character))
        characters = result.scalars().all()
        return characters


@router.post("/characters", response_model=CharacterResponse)
async def create_character(
    character: CharacterCreate,
    api_key: str = Depends(verify_api_key)
):
    """Create new character"""
    async with async_session() as session:
        new_character = Character(**character.model_dump())
        session.add(new_character)
        await session.commit()
        await session.refresh(new_character)
        logger.success(f"Created character: {new_character.name}")
        return new_character


@router.get("/characters/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Get character by ID"""
    async with async_session() as session:
        result = await session.execute(
            select(Character).where(Character.id == character_id)
        )
        character = result.scalars().first()
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        return character


@router.put("/characters/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    character_update: CharacterUpdate,
    api_key: str = Depends(verify_api_key)
):
    """Update character"""
    async with async_session() as session:
        result = await session.execute(
            select(Character).where(Character.id == character_id)
        )
        character = result.scalars().first()
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        # Update fields
        update_data = character_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(character, key, value)
        
        session.add(character)
        await session.commit()
        await session.refresh(character)
        logger.success(f"Updated character: {character.name}")
        return character


@router.delete("/characters/{character_id}")
async def delete_character(
    character_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Delete character"""
    async with async_session() as session:
        result = await session.execute(
            select(Character).where(Character.id == character_id)
        )
        character = result.scalars().first()
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        await session.delete(character)
        await session.commit()
        logger.info(f"Deleted character: {character.name}")
        return {"message": f"Character '{character.name}' deleted"}


@router.post("/chat")
async def roleplay_chat(
    request: RoleplayRequest,
    api_key: str = Depends(verify_api_key)
):
    """Chat with a character (non-streaming)"""
    async with async_session() as session:
        # Get character
        result = await session.execute(
            select(Character).where(Character.id == request.character_id)
        )
        character = result.scalars().first()
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        # Get or create session
        if request.session_id:
            result = await session.execute(
                select(Session).where(Session.id == request.session_id)
            )
            chat_session = result.scalars().first()
            if not chat_session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            chat_session = Session(
                title=f"Chat with {character.name}",
                character_id=character.id
            )
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
        
        # Build messages with character system prompt
        messages = [{"role": msg.role, "content": msg.content} for msg in history]
        messages.append({"role": "user", "content": request.message})
        
        # Save user message
        user_msg = Message(
            session_id=chat_session.id,
            role="user",
            content=request.message
        )
        session.add(user_msg)
        
        # Generate response with character personality
        ollama = await get_ollama_service()
        response = await ollama.chat(
            messages=messages,
            model=character.model_preference or ollama.primary_model,
            temperature=character.temperature,
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
        
        return {
            "message": assistant_content,
            "session_id": chat_session.id,
            "message_id": assistant_msg.id,
            "character": character.name
        }


@router.post("/chat/stream")
async def roleplay_chat_stream(
    request: RoleplayRequest,
    api_key: str = Depends(verify_api_key)
):
    """Chat with character (streaming)"""
    async def generate() -> AsyncGenerator[str, None]:
        async with async_session() as session:
            # Get character
            result = await session.execute(
                select(Character).where(Character.id == request.character_id)
            )
            character = result.scalars().first()
            if not character:
                yield f"data: {json.dumps({'error': 'Character not found'})}\n\n"
                return
            
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
                chat_session = Session(
                    title=f"Chat with {character.name}",
                    character_id=character.id
                )
                session.add(chat_session)
                await session.commit()
                await session.refresh(chat_session)
            
            yield f"data: {json.dumps({'session_id': chat_session.id, 'type': 'session', 'character': character.name})}\n\n"
            
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
            
            # Stream response with character personality
            ollama = await get_ollama_service()
            full_response = ""
            async for chunk in ollama.chat(
                messages=messages,
                model=character.model_preference or ollama.primary_model,
                temperature=character.temperature,
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
            
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
