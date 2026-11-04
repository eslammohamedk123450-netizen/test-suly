"""Add durable idempotency and partial response state for chat requests."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "9f4a2b7c1d03"
down_revision: Union[str, None] = "8e3f1a2b7c90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "chat_request_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=True),
        sa.Column("request_key", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("reply", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("credit_balance", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "request_key", name="uq_chat_request_user_key"),
    )
    op.create_index("ix_chat_request_records_user_id", "chat_request_records", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_chat_request_records_user_id", table_name="chat_request_records")
    op.drop_table("chat_request_records")
