"""Settings model for user preferences and configurations."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class Settings(Base):
    """Settings model for user preferences."""
    
    __tablename__ = "settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # UI Settings
    language = Column(String(10), default="en", nullable=False)
    theme = Column(String(20), default="system", nullable=False)  # light, dark, system
    font_size = Column(Integer, default=14, nullable=False)
    
    # Chat Settings (stored as JSONB for flexibility)
    chat_settings = Column(JSONB, nullable=False, default=dict)
    
    # Provider Configurations (stored as JSONB, encrypted API keys)
    providers = Column(JSONB, nullable=False, default=list)
    
    # Keyboard Shortcuts (stored as JSONB)
    shortcuts = Column(JSONB, nullable=False, default=dict)
    
    # MCP Configuration (stored as JSONB)
    mcp_config = Column(JSONB, nullable=False, default=dict)
    
    # Web Search Configuration (stored as JSONB)
    web_search_config = Column(JSONB, nullable=False, default=dict)
    
    # Desktop-specific settings (stored as JSONB)
    desktop_settings = Column(JSONB, nullable=True, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="settings")
    
    def __repr__(self):
        return f"<Settings(id={self.id}, user_id={self.user_id}, language={self.language}, theme={self.theme})>"

