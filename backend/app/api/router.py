"""Centralized API router for versioned routes.

All versioned API routes are registered here and mounted under the
configured API v1 prefix.
"""
from fastapi import APIRouter

from backend.app.core.config import settings
from backend.app.routes.health import router as health_router
from backend.app.auth.router import router as auth_router
from backend.app.routes.chat import router as chat_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.files import router as files_router

api_router = APIRouter(prefix=settings.api_v1_prefix)

api_router.include_router(health_router, tags=["Health"])

# Authentication routes
api_router.include_router(auth_router, tags=["Authentication"])

# Chat routes
api_router.include_router(chat_router, tags=["Chat"])

# Protected administrative routes
api_router.include_router(admin_router, tags=["Admin"])
api_router.include_router(files_router, tags=["Files"])
