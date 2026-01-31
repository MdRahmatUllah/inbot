"""Settings schemas for request/response DTOs."""

from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class SettingsUpdateRequest(BaseModel):
    """Settings update request schema."""
    
    language: Optional[str] = Field(None, min_length=2, max_length=10, description="UI language")
    theme: Optional[str] = Field(None, description="Theme (light, dark, system)")
    font_size: Optional[int] = Field(None, ge=10, le=24, description="Font size")
    chat_settings: Optional[Dict[str, Any]] = Field(None, description="Chat settings")
    providers: Optional[List[Dict[str, Any]]] = Field(None, description="Provider configurations")
    shortcuts: Optional[Dict[str, Any]] = Field(None, description="Keyboard shortcuts")
    mcp_config: Optional[Dict[str, Any]] = Field(None, description="MCP configuration")
    web_search_config: Optional[Dict[str, Any]] = Field(None, description="Web search configuration")
    desktop_settings: Optional[Dict[str, Any]] = Field(None, description="Desktop-specific settings")


class SettingsResponse(BaseModel):
    """Settings response schema."""

    id: str
    user_id: str
    language: str
    theme: str
    font_size: int
    chat_settings: Dict[str, Any]
    providers: List[Dict[str, Any]]
    shortcuts: Dict[str, Any]
    mcp_config: Dict[str, Any]
    web_search_config: Dict[str, Any]
    desktop_settings: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        """Convert UUID to string."""
        if isinstance(v, UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True

