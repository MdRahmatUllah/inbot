"""Session service for session management."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from fastapi import HTTPException, status

from app.models.session import Session, SessionType
from app.models.user import User
from app.schemas.session import SessionCreateRequest, SessionUpdateRequest, SessionResponse, SessionListResponse


class SessionService:
    """Session service for CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        """Initialize session service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    async def create_session(self, user: User, request: SessionCreateRequest) -> Session:
        """Create a new session.
        
        Args:
            user: Current user
            request: Session creation request
            
        Returns:
            Created session
        """
        session = Session(
            user_id=user.id,
            type=SessionType(request.type.value),
            name=request.name,
            copilot_id=request.copilot_id,
            settings=request.settings or {}
        )
        
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
    
    async def get_session(self, session_id: UUID, user: User) -> Session:
        """Get a session by ID.
        
        Args:
            session_id: Session ID
            user: Current user
            
        Returns:
            Session
            
        Raises:
            HTTPException: If session not found or unauthorized
        """
        result = await self.db.execute(
            select(Session).where(
                and_(
                    Session.id == session_id,
                    Session.user_id == user.id
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return session
    
    async def list_sessions(
        self,
        user: User,
        session_type: Optional[str] = None,
        starred: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> SessionListResponse:
        """List user sessions with filtering.
        
        Args:
            user: Current user
            session_type: Filter by session type (chat/picture)
            starred: Filter by starred status
            limit: Maximum number of sessions to return
            offset: Number of sessions to skip
            
        Returns:
            Session list response
        """
        # Build query
        query = select(Session).where(Session.user_id == user.id)
        
        if session_type:
            query = query.where(Session.type == SessionType(session_type))
        
        if starred is not None:
            query = query.where(Session.starred == starred)
        
        # Order by created_at descending
        query = query.order_by(desc(Session.created_at))
        
        # Count total
        count_query = select(Session).where(Session.user_id == user.id)
        if session_type:
            count_query = count_query.where(Session.type == SessionType(session_type))
        if starred is not None:
            count_query = count_query.where(Session.starred == starred)
        
        total_result = await self.db.execute(count_query)
        total = len(total_result.scalars().all())
        
        # Apply pagination
        query = query.limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        sessions = result.scalars().all()
        
        return SessionListResponse(
            sessions=[SessionResponse.model_validate(s) for s in sessions],
            total=total,
            limit=limit,
            offset=offset
        )

    async def update_session(
        self,
        session_id: UUID,
        user: User,
        request: SessionUpdateRequest
    ) -> Session:
        """Update a session.

        Args:
            session_id: Session ID
            user: Current user
            request: Session update request

        Returns:
            Updated session

        Raises:
            HTTPException: If session not found or unauthorized
        """
        session = await self.get_session(session_id, user)

        # Update fields
        if request.name is not None:
            session.name = request.name
        if request.starred is not None:
            session.starred = request.starred
        if request.copilot_id is not None:
            session.copilot_id = request.copilot_id
        if request.assistant_avatar_key is not None:
            session.assistant_avatar_key = request.assistant_avatar_key
        if request.settings is not None:
            session.settings = request.settings
        if request.thread_name is not None:
            session.thread_name = request.thread_name

        await self.db.commit()
        await self.db.refresh(session)

        return session

    async def delete_session(self, session_id: UUID, user: User) -> None:
        """Delete a session.

        Args:
            session_id: Session ID
            user: Current user

        Raises:
            HTTPException: If session not found or unauthorized
        """
        session = await self.get_session(session_id, user)

        await self.db.delete(session)
        await self.db.commit()

