"""Add actual dates/priority to tasks, last_login/password_set to users

Revision ID: 007
Revises: 006
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TYPE taskpriority AS ENUM ('low', 'medium', 'high')")
    op.add_column("tasks", sa.Column("priority", sa.Enum("low", "medium", "high", name="taskpriority"), nullable=True, server_default="medium"))
    op.add_column("tasks", sa.Column("actual_start_date", sa.Date(), nullable=True))
    op.add_column("tasks", sa.Column("actual_end_date", sa.Date(), nullable=True))
    op.add_column("tasks", sa.Column("delay_days", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("password_set", sa.Boolean(), nullable=False, server_default="true"))


def downgrade() -> None:
    op.drop_column("users", "password_set")
    op.drop_column("users", "last_login")
    op.drop_column("tasks", "delay_days")
    op.drop_column("tasks", "actual_end_date")
    op.drop_column("tasks", "actual_start_date")
    op.drop_column("tasks", "priority")
    op.execute("DROP TYPE IF EXISTS taskpriority")
