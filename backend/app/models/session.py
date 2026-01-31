"""Session model for chat and picture sessions."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class SessionType(str, enum.Enum):
    """Session type enumeration."""
    CHAT = "chat"
    PICTURE = "picture"


class Session(Base):
    """Session model for chat and picture conversations."""
    
    __tablename__ = "sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(SessionType), nullable=False, default=SessionType.CHAT)
    name = Column(String(200), nullable=False)
    starred = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # AI Configuration
    copilot_id = Column(UUID(as_uuid=True), nullable=True)
    assistant_avatar_key = Column(String(500), nullable=True)
    
    # Session-specific settings (stored as JSONB)
    settings = Column(JSONB, nullable=True)
    
    # Threading and forking (stored as JSONB)
    threads = Column(JSONB, nullable=True, default=list)
    thread_name = Column(String(200), nullable=True)
    message_forks_hash = Column(JSONB, nullable=True, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    # messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id}, type={self.type}, name={self.name})>"

