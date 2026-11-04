# Supabase integration

This project uses Supabase as the PostgreSQL database for the FastAPI backend. Flutter talks to FastAPI through `SULY_API_BASE_URL`; it must not contain a database password or service-role key.

- Project ref: `kamxjsddjxowodatafqo`
- Public project URL: `https://kamxjsddjxowodatafqo.supabase.co`
- Backend database secret: `DATABASE_URL` in the backend hosting secret manager only.
- Flutter API configuration: build with `--dart-define=SULY_API_BASE_URL=https://<backend-host>`.

The model-health migration is stored in `migrations/20261104175100_add_model_latency_circuit_breaker.sql` and mirrors the Alembic revision `b3c7d1e9f204`. The racing telemetry migration is stored in `migrations/20261104181000_create_racing_request_telemetry.sql` and mirrors Alembic revision `c4d8e2f1a903`. It adds `racing_requests` and `provider_attempts`, while the API-first stream emits `request_started`, `content_delta`, `stream_completed`, and `stream_error` events.

Racing timing defaults are configurable through `FREE_PROVIDER_GRACE_PERIOD`, `BROWSER_PREPARE_AT`, `WEB_PROVIDER_TIMEOUT`, and `FIRST_VALID_CHUNK_REQUIRED`. Browser automation is not enabled by these flags; it remains site-specific and opt-in.

Do not expose `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or provider API keys in Flutter, GitHub, or public files. The existing `suly_*` tables with disabled RLS are intentionally not changed by this migration; they need separately reviewed policies before enabling RLS.
