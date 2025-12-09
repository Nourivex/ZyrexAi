"""API v1 Router - Aggregates all endpoint routers"""
from fastapi import APIRouter
from app.api.v1.endpoints import health, chat, roleplay, agents, automations, tools, config

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(roleplay.router, prefix="/roleplay", tags=["roleplay"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(automations.router, prefix="/automations", tags=["automations"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(config.router, prefix="/config", tags=["config"])

# Note: FastAPI handles trailing slash redirects automatically
# For GET requests without trailing slash, it will redirect to with trailing slash
# This is expected behavior and works correctly
