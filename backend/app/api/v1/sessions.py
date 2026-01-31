"""Session API endpoints."""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.session import (
    SessionCreateRequest,
    SessionUpdateRequest,
    SessionResponse,
    SessionListResponse
)
from app.services.session_service import SessionService
from app.utils.dependencies import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    type: Optional[str] = Query(None, description="Filter by session type (chat/picture)"),
    starred: Optional[bool] = Query(None, description="Filter by starred status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of sessions to return"),
    offset: int = Query(0, ge=0, description="Number of sessions to skip"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List user sessions with filtering and pagination.
    
    Args:
        type: Filter by session type
        starred: Filter by starred status
        limit: Maximum number of sessions
        offset: Number of sessions to skip
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Session list response
    """
    session_service = SessionService(db)
    sessions = await session_service.list_sessions(
        user=current_user,
        session_type=type,
        starred=starred,
        limit=limit,
        offset=offset
    )
    
    return sessions


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: SessionCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new session.
    
    Args:
        request: Session creation request
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created session
    """
    session_service = SessionService(db)
    session = await session_service.create_session(current_user, request)
    
    return SessionResponse.model_validate(session)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a session by ID.
    
    Args:
        session_id: Session ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Session data
        
    Raises:
        HTTPException: If session not found or unauthorized
    """
    session_service = SessionService(db)
    session = await session_service.get_session(session_id, current_user)
    
    return SessionResponse.model_validate(session)


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: UUID,
    request: SessionUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a session.
    
    Args:
        session_id: Session ID
        request: Session update request
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated session
        
    Raises:
        HTTPException: If session not found or unauthorized
    """
    session_service = SessionService(db)
    session = await session_service.update_session(session_id, current_user, request)
    
    return SessionResponse.model_validate(session)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a session.
    
    Args:
        session_id: Session ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        No content
        
    Raises:
        HTTPException: If session not found or unauthorized
    """
    session_service = SessionService(db)
    await session_service.delete_session(session_id, current_user)
    
    return None

