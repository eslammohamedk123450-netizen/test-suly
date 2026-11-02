"""SULY AI API application entry point.

Creates the FastAPI application, registers the centralized API router,
and exposes the ASGI application for Uvicorn.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.core.config import settings
from backend.app.db.migrate import ensure_schema
from backend.app.db.session import engine


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    ensure_schema(engine)
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="SULY AI backend foundation (STEP 03).",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:8080",
            "https://8080-ic6wnd58xoe1qa175lpwj-ec688b3d.sg2.manus.computer",
        ],
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        allow_credentials=False,
    )

    app.include_router(api_router)

    return app


app = create_app()
