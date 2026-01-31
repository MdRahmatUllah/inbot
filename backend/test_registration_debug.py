"""Debug script to test registration directly."""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings as app_settings
from app.models.user import User
from app.models.settings import Settings
from app.utils.security import hash_password


async def test_registration():
    """Test user registration directly."""
    # Create async engine
    engine = create_async_engine(app_settings.database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Create user
            user = User(
                email="debug@example.com",
                username="debuguser",
                password_hash=hash_password("testpassword123")
            )
            
            session.add(user)
            await session.flush()  # Flush to get user.id
            
            print(f"User created with ID: {user.id}")
            
            # Create default settings
            default_settings = Settings(
                user_id=user.id,
                language="en",
                theme="system",
                font_size=14,
                chat_settings={
                    "show_message_timestamp": True,
                    "show_model_name": True,
                    "enable_markdown_rendering": True,
                },
                providers=[],
                shortcuts={},
                mcp_config={},
                web_search_config={},
                desktop_settings={}
            )
            
            session.add(default_settings)
            await session.commit()
            
            print("✅ Registration successful!")
            print(f"   User ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Username: {user.username}")
            
        except Exception as e:
            print(f"❌ Registration failed: {e}")
            import traceback
            traceback.print_exc()
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(test_registration())

