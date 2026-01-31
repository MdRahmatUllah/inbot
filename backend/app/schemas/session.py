"""Session schemas for request/response DTOs."""

from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class SessionTypeEnum(str, Enum):
    """Session type enumeration."""
    CHAT = "chat"
    PICTURE = "picture"


class SessionCreateRequest(BaseModel):
    """Session creation request schema."""
    
    type: SessionTypeEnum = Field(default=SessionTypeEnum.CHAT, description="Session type")
    name: str = Field(..., min_length=1, max_length=200, description="Session name")
    copilot_id: Optional[str] = Field(None, description="Copilot ID")
    settings: Optional[Dict[str, Any]] = Field(None, description="Session-specific settings")


class SessionUpdateRequest(BaseModel):
    """Session update request schema."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Session name")
    starred: Optional[bool] = Field(None, description="Starred flag")
    copilot_id: Optional[str] = Field(None, description="Copilot ID")
    assistant_avatar_key: Optional[str] = Field(None, description="Assistant avatar key")
    settings: Optional[Dict[str, Any]] = Field(None, description="Session-specific settings")
    thread_name: Optional[str] = Field(None, description="Thread name")


class SessionResponse(BaseModel):
    """Session response schema."""

    id: str
    user_id: str
    type: str
    name: str
    starred: bool
    created_at: datetime
    updated_at: datetime
    copilot_id: Optional[str] = None
    assistant_avatar_key: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    threads: Optional[List[Any]] = None
    thread_name: Optional[str] = None
    message_forks_hash: Optional[Dict[str, Any]] = None

    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        """Convert UUID to string."""
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Session list response schema."""
    
    sessions: List[SessionResponse]
    total: int
    limit: int
    offset: int

