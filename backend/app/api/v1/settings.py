"""Settings API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.settings import SettingsUpdateRequest, SettingsResponse
from app.services.settings_service import SettingsService
from app.utils.dependencies import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user settings.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User settings
        
    Raises:
        HTTPException: If settings not found
    """
    settings_service = SettingsService(db)
    settings = await settings_service.get_settings(current_user)
    
    return SettingsResponse.model_validate(settings)


@router.patch("", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user settings.
    
    Args:
        request: Settings update request
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated settings
        
    Raises:
        HTTPException: If settings not found
    """
    settings_service = SettingsService(db)
    settings = await settings_service.update_settings(current_user, request)
    
    return SettingsResponse.model_validate(settings)

