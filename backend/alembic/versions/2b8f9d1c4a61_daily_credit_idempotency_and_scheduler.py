"""Make daily credit grants idempotent and schedule Cairo-midnight grants.

Revision ID: 2b8f9d1c4a61
Revises: 35e2efd1bb72
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2b8f9d1c4a61"
down_revision: Union[str, None] = "35e2efd1bb72"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


APP_TABLES = (
    "ai_providers",
    "ai_models",
    "users",
    "revoked_tokens",
    "subscription_plans",
    "user_subscriptions",
    "audit_logs",
    "conversations",
    "credit_transactions",
    "projects",
    "system_settings",
    "messages",
)

DAILY_CREDIT_FUNCTION = r"""
CREATE OR REPLACE FUNCTION public.grant_suly_daily_credits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    cairo_now timestamp without time zone := timezone('Africa/Cairo', clock_timestamp());
    cairo_today date := cairo_now::date;
    cairo_hour integer := extract(hour FROM cairo_now)::integer;
    user_row record;
    grant_day date;
    transaction_id integer;
    resulting_balance integer;
    granted_count integer := 0;
BEGIN
    -- The scheduler runs in UTC at 21:00 and 22:00 to cover Cairo's UTC+2/+3
    -- offset. Only run during the first two Cairo hours after midnight.
    IF cairo_hour >= 2 THEN
        RETURN 0;
    END IF;

    FOR user_row IN
        SELECT id, created_at
        FROM public.users
        WHERE is_active IS TRUE AND is_admin IS FALSE
        ORDER BY id
        FOR UPDATE
    LOOP
        -- A new account receives its first daily bonus on the day after signup.
        grant_day := (user_row.created_at AT TIME ZONE 'Africa/Cairo')::date + 1;
        WHILE grant_day <= cairo_today LOOP
            transaction_id := NULL;
            INSERT INTO public.credit_transactions
                (user_id, amount, balance_after, reason, idempotency_key)
            VALUES
                (user_row.id, 200, 0, 'daily_bonus',
                 'daily_bonus:' || user_row.id::text || ':' || grant_day::text)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id INTO transaction_id;

            IF transaction_id IS NOT NULL THEN
                UPDATE public.users
                SET credit_balance = credit_balance + 200
                WHERE id = user_row.id
                RETURNING credit_balance INTO resulting_balance;

                UPDATE public.credit_transactions
                SET balance_after = resulting_balance
                WHERE id = transaction_id;

                granted_count := granted_count + 1;
            END IF;
            grant_day := grant_day + 1;
        END LOOP;
    END LOOP;

    RETURN granted_count;
END;
$function$;
"""


SCHEDULE_DAILY_CREDITS = r"""
DO $schedule$
BEGIN
    IF to_regclass('cron.job') IS NOT NULL THEN
        PERFORM cron.schedule(
            'suly-ai-daily-credits-21utc',
            '*/5 21 * * *',
            'SELECT public.grant_suly_daily_credits();'
        );
        PERFORM cron.schedule(
            'suly-ai-daily-credits-22utc',
            '*/5 22 * * *',
            'SELECT public.grant_suly_daily_credits();'
        );
    END IF;
END
$schedule$;
"""


RESTRICT_FUNCTION = r"""
REVOKE ALL ON FUNCTION public.grant_suly_daily_credits() FROM PUBLIC;
DO $roles$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE 'REVOKE ALL ON FUNCTION public.grant_suly_daily_credits() FROM anon';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE 'REVOKE ALL ON FUNCTION public.grant_suly_daily_credits() FROM authenticated';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.grant_suly_daily_credits() TO postgres';
    END IF;
END
$roles$;
"""


UNSCHEDULE_DAILY_CREDITS = r"""
DO $unschedule$
BEGIN
    IF to_regclass('cron.job') IS NOT NULL THEN
        PERFORM cron.unschedule(jobid)
        FROM cron.job
        WHERE jobname IN (
            'suly-ai-daily-credits-21utc',
            'suly-ai-daily-credits-22utc'
        );
    END IF;
END
$unschedule$;
"""


def upgrade() -> None:
    op.add_column(
        "credit_transactions",
        sa.Column("idempotency_key", sa.String(length=255), nullable=True),
    )
    op.create_index(
        "uq_credit_transactions_idempotency_key",
        "credit_transactions",
        ["idempotency_key"],
        unique=True,
    )

    if op.get_bind().dialect.name != "postgresql":
        return

    # These tables are owned by this FastAPI backend. The backend connects with
    # its private PostgreSQL role; no Supabase anon/authenticated API policies
    # are needed. This does not alter any pre-existing suly_* tables.
    for table_name in APP_TABLES:
        op.execute(f'ALTER TABLE public."{table_name}" ENABLE ROW LEVEL SECURITY')

    op.execute(DAILY_CREDIT_FUNCTION)
    op.execute(RESTRICT_FUNCTION)
    op.execute(SCHEDULE_DAILY_CREDITS)


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute(UNSCHEDULE_DAILY_CREDITS)
        op.execute("DROP FUNCTION IF EXISTS public.grant_suly_daily_credits()")

    op.drop_index("uq_credit_transactions_idempotency_key", table_name="credit_transactions")
    op.drop_column("credit_transactions", "idempotency_key")
