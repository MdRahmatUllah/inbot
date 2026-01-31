"""Authentication service for user registration, login, and token management."""

from datetime import timedelta
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.models.settings import Settings as UserSettings
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.config import settings as app_settings


class AuthService:
    """Authentication service for user management."""
    
    def __init__(self, db: AsyncSession):
        """Initialize auth service.
        
        Args:
            db: Database session
        """
        self.db = db
    
    async def register_user(self, request: RegisterRequest) -> User:
        """Register a new user.
        
        Args:
            request: Registration request data
            
        Returns:
            Created user
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        result = await self.db.execute(select(User).where(User.email == request.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = hash_password(request.password)
        
        # Create user
        user = User(
            email=request.email,
            username=request.username,
            password_hash=password_hash
        )
        
        self.db.add(user)
        await self.db.flush()  # Flush to get user.id
        
        # Create default settings for user
        default_settings = UserSettings(
            user_id=user.id,
            language="en",
            theme="system",
            font_size=14,
            chat_settings={
                "show_message_timestamp": True,
                "show_model_name": True,
                "show_token_count": False,
                "show_word_count": False,
                "show_token_used": False,
                "show_first_token_latency": False,
                "enable_markdown_rendering": True,
                "enable_latex_rendering": True,
                "enable_mermaid_rendering": True,
                "auto_preview_artifacts": False,
                "auto_collapse_code_block": False,
                "paste_long_text_as_a_file": True
            },
            providers=[],
            shortcuts={},
            mcp_config={},
            web_search_config={},
            desktop_settings={}
        )
        
        self.db.add(default_settings)
        await self.db.commit()
        await self.db.refresh(user)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User if authentication successful, None otherwise
        """
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user
    
    async def login(self, request: LoginRequest) -> TokenResponse:
        """Login a user and generate tokens.
        
        Args:
            request: Login request data
            
        Returns:
            Token response with access and refresh tokens
            
        Raises:
            HTTPException: If authentication fails
        """
        user = await self.authenticate_user(request.email, request.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate tokens
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        refresh_token = create_refresh_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=app_settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token.

        Args:
            refresh_token: Refresh token

        Returns:
            New token response

        Raises:
            HTTPException: If refresh token is invalid
        """
        # Decode refresh token
        payload = decode_token(refresh_token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify token type
        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user ID from token
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Fetch user from database
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Generate new tokens
        new_access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        new_refresh_token = create_refresh_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=app_settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

