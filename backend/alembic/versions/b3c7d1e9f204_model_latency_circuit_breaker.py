"""Track model latency and automatically quarantine repeated failures.

Revision ID: b3c7d1e9f204
Revises: a1b5c3d7e902
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b3c7d1e9f204"
down_revision: Union[str, None] = "a1b5c3d7e902"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("ai_models", sa.Column("consecutive_failures", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("ai_models", sa.Column("auto_disabled", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("ai_models", sa.Column("last_response_latency_ms", sa.Float(), nullable=True))
    op.add_column("ai_models", sa.Column("last_response_status", sa.String(length=20), nullable=True))
    op.add_column("ai_models", sa.Column("last_response_error", sa.String(length=500), nullable=True))
    op.add_column("ai_models", sa.Column("last_response_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("ai_models", "last_response_at")
    op.drop_column("ai_models", "last_response_error")
    op.drop_column("ai_models", "last_response_status")
    op.drop_column("ai_models", "last_response_latency_ms")
    op.drop_column("ai_models", "auto_disabled")
    op.drop_column("ai_models", "consecutive_failures")
