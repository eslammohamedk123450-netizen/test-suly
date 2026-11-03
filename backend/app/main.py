"""SULY AI API application entry point.

Creates the FastAPI application, registers the centralized API router,
and exposes the ASGI application for Uvicorn.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.app.api.router import api_router
from backend.app.core.config import settings


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="SULY AI backend with web interface.",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        allow_credentials=False,
    )

    app.include_router(api_router)

    # خدمة ملفات الواجهة الأمامية
    web_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "web")
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="web")

    return app


app = create_app()
