"""Settings service for user settings management."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import SettingsUpdateRequest, SettingsResponse


class SettingsService:
    """Settings service for CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        """Initialize settings service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    async def get_settings(self, user: User) -> Settings:
        """Get user settings.
        
        Args:
            user: Current user
            
        Returns:
            User settings
            
        Raises:
            HTTPException: If settings not found
        """
        result = await self.db.execute(
            select(Settings).where(Settings.user_id == user.id)
        )
        settings = result.scalar_one_or_none()
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Settings not found"
            )
        
        return settings
    
    async def update_settings(
        self,
        user: User,
        request: SettingsUpdateRequest
    ) -> Settings:
        """Update user settings.
        
        Args:
            user: Current user
            request: Settings update request
            
        Returns:
            Updated settings
            
        Raises:
            HTTPException: If settings not found
        """
        settings = await self.get_settings(user)
        
        # Update fields
        if request.language is not None:
            settings.language = request.language
        if request.theme is not None:
            settings.theme = request.theme
        if request.font_size is not None:
            settings.font_size = request.font_size
        if request.chat_settings is not None:
            settings.chat_settings = request.chat_settings
        if request.providers is not None:
            settings.providers = request.providers
        if request.shortcuts is not None:
            settings.shortcuts = request.shortcuts
        if request.mcp_config is not None:
            settings.mcp_config = request.mcp_config
        if request.web_search_config is not None:
            settings.web_search_config = request.web_search_config
        if request.desktop_settings is not None:
            settings.desktop_settings = request.desktop_settings
        
        await self.db.commit()
        await self.db.refresh(settings)
        
        return settings

