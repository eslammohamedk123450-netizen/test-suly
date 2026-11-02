"""Health check routes.

GET /api/v1/health reports that the backend application is initialized
and checks database connectivity using a lightweight query.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.core.config import settings
from backend.app.db.session import get_db

router = APIRouter()


@router.get(
    "/health",
    summary="Health check",
    tags=["Health"],
)
def health(db: Session = Depends(get_db)) -> JSONResponse:
    """Return the initialization status of the backend application.

    Executes a lightweight database connectivity query and reports
    the application status along with the database status.

    Returns HTTP 200 when the database connection succeeds.
    Returns HTTP 503 when the database connection fails.
    """
    db_status = "ok"
    try:
        # Execute a lightweight query to verify actual database connectivity.
        # text("SELECT 1") is the recommended lightweight connectivity check.
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        # Connection failure: report unhealthy without exposing internal details.
        db_status = "unhealthy"
        return JSONResponse(
            status_code=503,
            content={
                "status": db_status,
                "service": settings.app_name,
                "version": settings.app_version,
                "environment": settings.environment,
                "database": db_status,
            },
        )

    return JSONResponse(
        status_code=200,
        content={
            "status": db_status,
            "service": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment,
            "database": db_status,
        },
    )
