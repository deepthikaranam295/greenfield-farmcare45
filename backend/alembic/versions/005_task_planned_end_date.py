"""Add planned_end_date to tasks

Revision ID: 005
Revises: 004
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("planned_end_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "planned_end_date")
