"""Add extended fields to leads table to match enquiry form

Revision ID: 014
Revises: 013
Create Date: 2026-06-30
"""
from alembic import op
import sqlalchemy as sa

revision = "014"
down_revision = "013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS email       TEXT")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone       VARCHAR(20)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS state       VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS district    VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS mandal      VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS village     VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS size_acres  VARCHAR(50)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range TEXT")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS farm_coordinates TEXT")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS other_details    TEXT")


def downgrade() -> None:
    for col in ["email","phone","state","district","mandal","village",
                "size_acres","budget_range","farm_coordinates","other_details"]:
        op.execute(f"ALTER TABLE leads DROP COLUMN IF EXISTS {col}")
