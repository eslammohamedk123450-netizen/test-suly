# Supabase integration

This project uses Supabase as the PostgreSQL database for the FastAPI backend. Flutter talks to FastAPI through `SULY_API_BASE_URL`; it must not contain a database password or service-role key.

- Project ref: `kamxjsddjxowodatafqo`
- Public project URL: `https://kamxjsddjxowodatafqo.supabase.co`
- Backend database secret: `DATABASE_URL` in the backend hosting secret manager only.
- Flutter API configuration: build with `--dart-define=SULY_API_BASE_URL=https://<backend-host>`.

The model-health migration is stored in `migrations/20261104175100_add_model_latency_circuit_breaker.sql` and mirrors the Alembic revision `b3c7d1e9f204`. The migration adds latency, status, failure-streak, and automatic-quarantine fields to `public.ai_models`.

Do not expose `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or provider API keys in Flutter, GitHub, or public files. The existing `suly_*` tables with disabled RLS are intentionally not changed by this migration; they need separately reviewed policies before enabling RLS.
