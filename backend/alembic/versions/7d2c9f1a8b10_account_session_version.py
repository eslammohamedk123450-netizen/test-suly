"""Add per-user session version for password changes and global revocation."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "7d2c9f1a8b10"
down_revision: Union[str, None] = "2b8f9d1c4a61"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("users", sa.Column("session_version", sa.Integer(), nullable=False, server_default="1"))
    op.alter_column("users", "session_version", server_default=None)

def downgrade() -> None:
    op.drop_column("users", "session_version")
