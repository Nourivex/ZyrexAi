"""Agent endpoints for managing and executing autonomous agents"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from app.core.security import verify_api_key
from app.models.schemas import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentExecuteRequest,
    AgentExecuteResponse,
    AgentExecutionStep
)
from app.models.database import Agent, async_session
from app.services.agent_runner import get_agent_runner
from loguru import logger

router = APIRouter()


@router.get("/", response_model=list[AgentResponse])
async def list_agents(api_key: str = Depends(verify_api_key)):
    """Get all agents"""
    async with async_session() as session:
        result = await session.execute(select(Agent))
        agents = result.scalars().all()
        return agents


@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    api_key: str = Depends(verify_api_key)
):
    """Create new agent"""
    async with async_session() as session:
        new_agent = Agent(**agent.model_dump(exclude={"tools_enabled"}))
        new_agent.set_tools(agent.tools_enabled)
        
        session.add(new_agent)
        await session.commit()
        await session.refresh(new_agent)
        logger.success(f"Created agent: {new_agent.name}")
        
        return AgentResponse(
            id=new_agent.id,
            name=new_agent.name,
            description=new_agent.description,
            model_name=new_agent.model_name,
            system_prompt=new_agent.system_prompt,
            tools_enabled=new_agent.tools_list,
            is_active=new_agent.is_active,
            max_iterations=new_agent.max_iterations,
            created_at=new_agent.created_at
        )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Get agent by ID"""
    async with async_session() as session:
        result = await session.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalars().first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            model_name=agent.model_name,
            system_prompt=agent.system_prompt,
            tools_enabled=agent.tools_list,
            is_active=agent.is_active,
            max_iterations=agent.max_iterations,
            created_at=agent.created_at
        )


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    agent_update: AgentUpdate,
    api_key: str = Depends(verify_api_key)
):
    """Update agent"""
    async with async_session() as session:
        result = await session.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalars().first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Update fields
        update_data = agent_update.model_dump(exclude_unset=True, exclude={"tools_enabled"})
        for key, value in update_data.items():
            setattr(agent, key, value)
        
        # Update tools if provided
        if agent_update.tools_enabled is not None:
            agent.set_tools(agent_update.tools_enabled)
        
        session.add(agent)
        await session.commit()
        await session.refresh(agent)
        logger.success(f"Updated agent: {agent.name}")
        
        return AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            model_name=agent.model_name,
            system_prompt=agent.system_prompt,
            tools_enabled=agent.tools_list,
            is_active=agent.is_active,
            max_iterations=agent.max_iterations,
            created_at=agent.created_at
        )


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: int,
    api_key: str = Depends(verify_api_key)
):
    """Delete agent"""
    async with async_session() as session:
        result = await session.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalars().first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        await session.delete(agent)
        await session.commit()
        logger.info(f"Deleted agent: {agent.name}")
        return {"message": f"Agent '{agent.name}' deleted"}


@router.post("/{agent_id}/execute", response_model=AgentExecuteResponse)
async def execute_agent(
    agent_id: int,
    request: AgentExecuteRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute agent on a task"""
    async with async_session() as session:
        # Get agent
        result = await session.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalars().first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if not agent.is_active:
            raise HTTPException(status_code=400, detail="Agent is not active")
        
        logger.info(f"Executing agent '{agent.name}' on task: {request.task[:50]}...")
        
        # Run agent
        runner = get_agent_runner()
        result = await runner.run(
            task=request.task,
            tools=agent.tools_list,
            system_prompt=agent.system_prompt
        )
        
        # Format response
        steps = [AgentExecutionStep(**step) for step in result.get("steps", [])]
        
        return AgentExecuteResponse(
            result=result.get("result", ""),
            steps=steps,
            success=result.get("success", False),
            error=result.get("error")
        )
