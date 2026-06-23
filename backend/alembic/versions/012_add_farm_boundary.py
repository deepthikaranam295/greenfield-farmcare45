"""Add boundary_geojson column to farms

Revision ID: 012
Revises: 011
Create Date: 2026-06-23
"""
from alembic import op

revision = "012"
down_revision = "011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE farms ADD COLUMN IF NOT EXISTS boundary_geojson TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE farms DROP COLUMN IF EXISTS boundary_geojson")
