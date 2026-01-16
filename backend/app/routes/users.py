"""
User API Router - Default user context for MVP (no auth).
"""
from fastapi import APIRouter

from app.core.database import prisma
from app.routes.event_types import ensure_default_user
from app.schemas import UserResponse

router = APIRouter(tags=["User"])


@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """Get current user context (default user for MVP)."""
    user = await ensure_default_user(prisma)
    
    return UserResponse(
        id=user.id,
        username=user.username,
        name=user.name,
        email=user.email,
        timezone=user.timezone,
        created_at=user.createdAt,
        updated_at=user.updatedAt
    )
