# SULY AI Backend (STEP 03 + STEP 04)

Initial FastAPI backend foundation for SULY AI.

## Technology

- Python 3.10+
- FastAPI
- Pydantic v2
- Pydantic Settings
- SQLAlchemy 2.x (architecture prepared, not installed)
- Alembic (migration structure prepared, not installed)
- Uvicorn (ASGI server)

## Structure

```
backend/
  app/
    main.py             # Application entry point (create_app + ASGI app)
    core/
      config.py         # Centralized, env-var-ready settings
    api/
      router.py         # Centralized versioned API router
    routes/
      health.py         # GET /api/v1/health
    db/
      __init__.py       # Database package marker
      config.py         # Database settings from environment variables
      base.py           # SQLAlchemy declarative base
      session.py        # Engine, SessionLocal, get_db dependency
      models/
        __init__.py     # Model package exports
        user.py         # User model
        project.py      # Project model
    schemas/            # Reserved for future request/response schemas
    services/           # Reserved for future business logic
    tests/              # Reserved for future tests
  requirements.txt      # Dependency declarations (not installed)
  .env.example          # Safe environment variable template (no secrets)
  README.md             # This file
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Reports backend initialization status |

## Database Architecture

### Design principles
- **Production target:** PostgreSQL.
- **Local development:** SQLite compatible via `DATABASE_URL`.
- **ORM:** SQLAlchemy 2.x declarative style (`Mapped`, `mapped_column`, `DeclarativeBase`).
- **Migrations:** Alembic directory structure reserved; migrations are not created in this step.
- **Configuration:** All connection settings read from environment variables; no hardcoded secrets.
- **Separation:** Database layer is independent from API route logic. The database is **not** connected to the health endpoint yet.

### Models

| Table | Key fields | Relationships |
|-------|-----------|---------------|
| `users` | `id`, `email` (unique), `full_name`, `is_active`, `created_at`, `updated_at` | One-to-many: `users` → `projects` |
| `projects` | `id`, `name`, `description`, `owner_id` (FK → users.id), `is_archived`, `created_at`, `updated_at` | Many-to-one: `projects` → `users` |

Timestamps are timezone-aware (`DateTime(timezone=True)`) and use server-side `now()` defaults.

### Required environment variables

| Variable | Example value | Description |
|----------|---------------|-------------|
| `DATABASE_URL` | `sqlite:///./suly_ai.db` | SQLAlchemy database connection string |
| `DATABASE_ECHO` | `false` | Enable SQL statement logging |

## Getting Started

1. Create a virtual environment (optional but recommended).
2. Install dependencies:

   ```sh
   pip install -r backend/requirements.txt
   ```

3. Copy `.env.example` to `.env` and adjust values as needed.
4. Run the server from the repository root:

   ```sh
   uvicorn backend.app.main:app --reload
   ```

## Future migration workflow (Alembic)

When SQLAlchemy and Alembic are installed:

1. Initialize Alembic (once):

   ```sh
   alembic init backend/alembic
   ```

2. Update `alembic.ini` and `backend/alembic/env.py` to point at
   `backend.app.db.config.db_settings.database_url` and
   `backend.app.db.base.Base.metadata`.

3. Generate and apply migrations:

   ```sh
   alembic revision --autogenerate -m "Initial models"
   alembic upgrade head
   ```

## Security

- No secrets are hardcoded. All sensitive values come from environment variables.
- `.env.example` contains only placeholder values; never commit a real `.env`.

## Important notices

- **No database connection has been tested.** Dependencies are not installed in this environment.
- **No database tables have been created.** Alembic migrations have not been generated.
- **No authentication is implemented.** The `User` model is a data model only.

## Scope

This step only establishes the database foundation. Authentication, subscriptions,
credits, payments, agents, chat messages, connectors, and admin modules are
intentionally not implemented here.

