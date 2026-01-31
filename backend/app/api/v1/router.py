"""API v1 router combining all v1 endpoints."""

from fastapi import APIRouter

from app.api.v1 import auth, sessions, settings


# Create v1 router
router = APIRouter(prefix="/v1")

# Include all v1 routers
router.include_router(auth.router)
router.include_router(sessions.router)
router.include_router(settings.router)

