"""Persist provider-racing request and attempt telemetry.

Revision ID: c4d8e2f1a903
Revises: b3c7d1e9f204
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c4d8e2f1a903"
down_revision: Union[str, None] = "b3c7d1e9f204"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "racing_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="started"),
        sa.Column("winning_provider_id", sa.Integer(), sa.ForeignKey("ai_providers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("first_token_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_duration_ms", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.UniqueConstraint("request_id", name="uq_racing_requests_request_id"),
    )
    op.create_index("ix_racing_requests_user_id", "racing_requests", ["user_id"])
    op.create_index("ix_racing_requests_conversation_id", "racing_requests", ["conversation_id"])
    op.create_index("ix_racing_requests_user_created", "racing_requests", ["user_id", "started_at"])
    op.create_index("ix_racing_requests_request_id", "racing_requests", ["request_id"])

    op.create_table(
        "provider_attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("racing_request_id", sa.Integer(), sa.ForeignKey("racing_requests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("ai_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("model_id", sa.Integer(), sa.ForeignKey("ai_models.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="started"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("first_token_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.String(length=500), nullable=True),
    )
    op.create_index("ix_provider_attempts_racing_request_id", "provider_attempts", ["racing_request_id"])
    op.create_index("ix_provider_attempts_provider_id", "provider_attempts", ["provider_id"])
    op.create_index("ix_provider_attempts_model_id", "provider_attempts", ["model_id"])
    op.create_index("ix_provider_attempts_racing_request", "provider_attempts", ["racing_request_id"])


def downgrade() -> None:
    op.drop_index("ix_provider_attempts_racing_request", table_name="provider_attempts")
    op.drop_index("ix_provider_attempts_model_id", table_name="provider_attempts")
    op.drop_index("ix_provider_attempts_provider_id", table_name="provider_attempts")
    op.drop_index("ix_provider_attempts_racing_request_id", table_name="provider_attempts")
    op.drop_table("provider_attempts")
    op.drop_index("ix_racing_requests_request_id", table_name="racing_requests")
    op.drop_index("ix_racing_requests_user_created", table_name="racing_requests")
    op.drop_index("ix_racing_requests_conversation_id", table_name="racing_requests")
    op.drop_index("ix_racing_requests_user_id", table_name="racing_requests")
    op.drop_table("racing_requests")
