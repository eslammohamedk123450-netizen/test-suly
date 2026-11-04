"""Add user-owned uploaded file metadata."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "8e3f1a2b7c90"
down_revision: Union[str, None] = "7d2c9f1a8b10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "user_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("storage_name", sa.String(length=255), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_name"),
    )
    op.create_index("ix_user_files_id", "user_files", ["id"])
    op.create_index("ix_user_files_user_id", "user_files", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_user_files_user_id", table_name="user_files")
    op.drop_index("ix_user_files_id", table_name="user_files")
    op.drop_table("user_files")
