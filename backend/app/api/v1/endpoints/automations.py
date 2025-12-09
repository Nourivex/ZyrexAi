"""Automation endpoints for scheduled tasks"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from app.core.security import verify_api_key
from app.models.schemas import (
    AutomationCreate,
    AutomationUpdate,
    AutomationResponse
)
from app.models.database import Automation, async_session
from loguru import logger
from croniter import croniter
from datetime import datetime

router = APIRouter()


def validate_cron_expression(cron_expr: str) -> bool:
    """Validate cron expression"""
    try:
        croniter(cron_expr)
        return True
    except Exception:
        return False


@router.get("/", response_model=list[AutomationResponse])
async def list_automations(api_key: str = Depends(verify_api_key)):
    """Get all automations"""
    async with async_session() as session:
        result = await session.execute(select(Automation))
        automations = result.scalars().all()
        
        # Convert to response format
        responses = []
        for auto in automations:
            responses.append(AutomationResponse(
                id=auto.id,
                name=auto.name,
                description=auto.description,
                cron_expression=auto.cron_expression,
                agent_id=auto.agent_id,
                action_type=auto.action_type,
                action_config=auto.config_dict,
                is_active=auto.is_active,
                last_run=auto.last_run,
                next_run=auto.next_run,
                created_at=auto.created_at
            ))
        
        return responses


@router.post("/", response_model=AutomationResponse)
async def create_automation(
    automation: AutomationCreate,
    api_key: str = Depends(verify_api_key)
):
    """Create new automation"""
    # Validate cron expression
    if not validate_cron_expression(automation.cron_expression):
        raise HTTPException(
            status_code=400,
            detail="Invalid cron expression. Use format: '0 7 * * *'"
        )
    
    async with async_session() as session:
        new_auto = Automation(
            name=automation.name,
            description=automation.description,
            cron_expression=automation.cron_expression,
            agent_id=automation.agent_id,
            action_type=automation.action_type,
            action_config=""  # Will be set below
        )
        new_auto.set_config(automation.action_config)
        
        # Calculate next run time
        cron = croniter(automation.cron_expression, datetime.now())
        new_auto.next_run = cron.get_next(datetime)
        
        session.add(new_auto)
        await session.commit()
        await session.refresh(new_auto)
        logger.success(f"Created automation: {new_auto.name}")
        
        return AutomationResponse(
            id=new_auto.id,
            name=new_auto.name,
            description=new_auto.description,
            cron_expression=new_auto.cron_expression,
            agent_id=new_auto.agent_id,
            action_type=new_auto.action_type,
            action_config=new_auto.config_dict,
            is_active=new_auto.is_active,
            last_run=new_auto.last_run,
            next_run=new_auto.next_run,
            created_at=new_auto.created_at
        )


@router.get("/{automation_id}", response_model=AutomationResponse)
async def get_automation(
    automation_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Get automation by ID"""
    async with async_session() as session:
        result = await session.execute(
            select(Automation).where(Automation.id == automation_id)
        )
        auto = result.scalars().first()
        if not auto:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        return AutomationResponse(
            id=auto.id,
            name=auto.name,
            description=auto.description,
            cron_expression=auto.cron_expression,
            agent_id=auto.agent_id,
            action_type=auto.action_type,
            action_config=auto.config_dict,
            is_active=auto.is_active,
            last_run=auto.last_run,
            next_run=auto.next_run,
            created_at=auto.created_at
        )


@router.put("/{automation_id}", response_model=AutomationResponse)
async def update_automation(
    automation_id: int,
    automation_update: AutomationUpdate,
    api_key: str = Depends(verify_api_key)
):
    """Update automation"""
    async with async_session() as session:
        result = await session.execute(
            select(Automation).where(Automation.id == automation_id)
        )
        auto = result.scalars().first()
        if not auto:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        # Validate cron if updated
        if automation_update.cron_expression:
            if not validate_cron_expression(automation_update.cron_expression):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid cron expression"
                )
        
        # Update fields
        update_data = automation_update.model_dump(exclude_unset=True, exclude={"action_config"})
        for key, value in update_data.items():
            setattr(auto, key, value)
        
        # Update action config if provided
        if automation_update.action_config is not None:
            auto.set_config(automation_update.action_config)
        
        # Recalculate next run if cron changed
        if automation_update.cron_expression:
            cron = croniter(auto.cron_expression, datetime.now())
            auto.next_run = cron.get_next(datetime)
        
        session.add(auto)
        await session.commit()
        await session.refresh(auto)
        logger.success(f"Updated automation: {auto.name}")
        
        return AutomationResponse(
            id=auto.id,
            name=auto.name,
            description=auto.description,
            cron_expression=auto.cron_expression,
            agent_id=auto.agent_id,
            action_type=auto.action_type,
            action_config=auto.config_dict,
            is_active=auto.is_active,
            last_run=auto.last_run,
            next_run=auto.next_run,
            created_at=auto.created_at
        )


@router.delete("/{automation_id}")
async def delete_automation(
    automation_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Delete automation"""
    async with async_session() as session:
        result = await session.execute(
            select(Automation).where(Automation.id == automation_id)
        )
        auto = result.scalars().first()
        if not auto:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        await session.delete(auto)
        await session.commit()
        logger.info(f"Deleted automation: {auto.name}")
        return {"message": f"Automation '{auto.name}' deleted"}


@router.post("/{automation_id}/toggle")
async def toggle_automation(
    automation_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Toggle automation active status"""
    async with async_session() as session:
        result = await session.execute(
            select(Automation).where(Automation.id == automation_id)
        )
        auto = result.scalars().first()
        if not auto:
            raise HTTPException(status_code=404, detail="Automation not found")
        
        auto.is_active = not auto.is_active
        session.add(auto)
        await session.commit()
        
        status = "enabled" if auto.is_active else "disabled"
        logger.info(f"Automation '{auto.name}' {status}")
        
        return {
            "message": f"Automation {status}",
            "is_active": auto.is_active
        }
