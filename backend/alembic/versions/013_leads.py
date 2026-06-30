"""Add leads table for site visit requests

Revision ID: 013
Revises: 012
Create Date: 2026-06-30
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("COMMIT"))
    conn.execute(sa.text(
        "DO $$ BEGIN "
        "CREATE TYPE leadstatus AS ENUM "
        "('new', 'contacted', 'visit_scheduled', 'converted', 'not_interested'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    ))
    conn.execute(sa.text("BEGIN"))

    op.create_table(
        "leads",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("whatsapp", sa.String(20), nullable=False),
        sa.Column("city", sa.String(255), nullable=True),
        sa.Column("farm_location", sa.Text, nullable=True),
        sa.Column("farm_size", sa.String(50), nullable=True),
        sa.Column("services", sa.Text, nullable=True),
        sa.Column("status", sa.Enum("new", "contacted", "visit_scheduled", "converted", "not_interested", name="leadstatus"), nullable=False, server_default="new"),
        sa.Column("assigned_to", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_leads_status", "leads", ["status"])
    op.create_index("ix_leads_assigned_to", "leads", ["assigned_to"])
    op.create_index("ix_leads_is_deleted", "leads", ["is_deleted"])


def downgrade() -> None:
    op.drop_index("ix_leads_is_deleted", table_name="leads")
    op.drop_index("ix_leads_assigned_to", table_name="leads")
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_table("leads")
    op.execute("DROP TYPE IF EXISTS leadstatus")
