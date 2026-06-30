"""Add leads table for site visit requests

Revision ID: 013
Revises: 012
Create Date: 2026-06-30
"""
from alembic import op
import sqlalchemy as sa

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create enum type outside any transaction (required by PostgreSQL)
    conn.execute(sa.text("COMMIT"))
    conn.execute(sa.text(
        "DO $$ BEGIN "
        "CREATE TYPE leadstatus AS ENUM "
        "('new','contacted','visit_scheduled','converted','not_interested'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    ))
    conn.execute(sa.text("BEGIN"))

    # Use raw SQL for table creation to avoid SQLAlchemy auto-emitting CREATE TYPE
    op.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name        VARCHAR(255) NOT NULL,
            whatsapp    VARCHAR(20)  NOT NULL,
            city        VARCHAR(255),
            farm_location TEXT,
            farm_size   VARCHAR(50),
            services    TEXT,
            status      leadstatus   NOT NULL DEFAULT 'new',
            assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
            notes       TEXT,
            is_deleted  BOOLEAN      NOT NULL DEFAULT false,
            deleted_at  TIMESTAMPTZ,
            created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_leads_status      ON leads (status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_leads_assigned_to ON leads (assigned_to)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_leads_is_deleted  ON leads (is_deleted)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_leads_is_deleted")
    op.execute("DROP INDEX IF EXISTS ix_leads_assigned_to")
    op.execute("DROP INDEX IF EXISTS ix_leads_status")
    op.execute("DROP TABLE IF EXISTS leads")
    op.execute("DROP TYPE  IF EXISTS leadstatus")
