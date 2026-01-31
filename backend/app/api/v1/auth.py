"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
    TokenRefreshRequest
)
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user.
    
    Args:
        request: Registration request data
        db: Database session
        
    Returns:
        Created user data
        
    Raises:
        HTTPException: If email already exists or validation fails
    """
    auth_service = AuthService(db)
    user = await auth_service.register_user(request)
    
    return RegisterResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login a user and generate access/refresh tokens.
    
    Args:
        request: Login request data
        db: Database session
        
    Returns:
        Token response with access and refresh tokens
        
    Raises:
        HTTPException: If authentication fails
    """
    auth_service = AuthService(db)
    token_response = await auth_service.login(request)
    
    return token_response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token.
    
    Args:
        request: Token refresh request
        db: Database session
        
    Returns:
        New token response
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    auth_service = AuthService(db)
    token_response = await auth_service.refresh_access_token(request.refresh_token)
    
    return token_response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """Logout a user (client-side token removal).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        No content
        
    Note:
        This endpoint is mainly for consistency with the API spec.
        Actual logout is handled client-side by removing tokens.
        In the future, we can implement token blacklisting here.
    """
    # For now, logout is handled client-side
    # In the future, we can add token blacklisting to Redis
    return None

