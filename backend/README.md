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

- The application initializes the current SQLAlchemy schema at startup; use versioned migrations before production schema evolution.
- Authentication and an admin API exist, but production secrets and an AI provider must be configured by the operator. Logout revokes the current signed access token server-side until expiry.

## Scope

Payments, provider-specific protocols other than OpenAI-compatible chat, advanced agents, and persistent chat history are not implemented yet.

## AI chat provider configuration

`POST /api/v1/chat/` now sends the message and up to 40 prior user/assistant turns to the first enabled model/provider. The admin UI includes presets for `openrouter`, `deepseek`, `groq`, `openai`, and `google_ai_studio`; each uses the OpenAI-compatible `chat/completions` protocol and can be customized with a different HTTPS base URL. Enter the secret only in the masked admin form, use a unique connection name for each key, and supply a model identifier recognized by that provider. The server encrypts stored keys; it never returns the complete key. HTTP is accepted only for loopback development URLs.

Chat requests require an active user Bearer token. Flutter offers sign-in/registration when the user sends the first chat message and keeps the short-lived token in memory only. **Before public production, add per-user rate limits and enforce credit/usage quotas:** the current chat endpoint authenticates users but does not yet deduct credits or cap requests.

Check each provider's official reference for current model identifiers and feature support: [OpenRouter](https://openrouter.ai/docs/api_reference/overview), [DeepSeek](https://api-docs.deepseek.com/api/create-chat-completion/), [Groq](https://console.groq.com/docs/openai), [OpenAI](https://platform.openai.com/api-reference/resources/chat/subresources/completions/methods/create), and [Google AI Studio](https://ai.google.dev/gemini-api/docs/openai). Google documents its OpenAI compatibility as beta; Groq implements partial compatibility.

Set `CORS_ALLOWED_ORIGINS` as a JSON array of exact origins in `.env` or the hosting environment (for example `CORS_ALLOWED_ORIGINS=["https://app.example.com"]`). The default list is for local development only. CORS now includes the `PUT` and `PATCH` methods required by admin operations; credentials remain disabled because API authentication uses Bearer tokens.

Before starting the backend, copy the root `.env.example` to `.env` and set unique values for `SECRET_KEY`, `CREDENTIAL_ENCRYPTION_KEY`, and (when bootstrapping the first admin) `ADMIN_BOOTSTRAP_TOKEN`. Generate them locally, for example:

```sh
python -c "import secrets; print(secrets.token_urlsafe(48))"
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

The encryption key must remain stable: replacing it makes previously stored provider keys unreadable. Do not put provider API keys in Flutter or commit `.env`. Provider calls include bounded recent conversation history; unsupported protocols return HTTP 503 instead of a mock answer.

Run backend tests with `pip install -r backend/requirements-dev.txt` followed by `PYTHONPATH=. pytest backend/tests` from the repository root. The current test suite passes 8 tests.
