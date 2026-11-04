-- Keeps Supabase's schema aligned with the FastAPI model-health race feature.
-- Safe to re-run because each column is guarded with IF NOT EXISTS.
ALTER TABLE public.ai_models
  ADD COLUMN IF NOT EXISTS consecutive_failures integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_response_latency_ms double precision,
  ADD COLUMN IF NOT EXISTS last_response_status varchar(20),
  ADD COLUMN IF NOT EXISTS last_response_error varchar(500),
  ADD COLUMN IF NOT EXISTS last_response_at timestamptz;

-- The backend's Alembic history is kept in sync when this migration is applied
-- to the already-initialized project. On a fresh database this UPDATE is a no-op.
UPDATE public.alembic_version
SET version_num = 'b3c7d1e9f204'
WHERE version_num = '2b8f9d1c4a61';

-- The racing telemetry migration advances this value to c4d8e2f1a903.
