"""Add farm_activities table

Revision ID: 006
Revises: 005
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "farm_activities",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farm_id", UUID(as_uuid=True), sa.ForeignKey("farms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "type",
            sa.Enum("expense", "income", "activity", "note", name="activitytype"),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_farm_activities_farm_id", "farm_activities", ["farm_id"])
    op.create_index("ix_farm_activities_date", "farm_activities", ["date"])


def downgrade() -> None:
    op.drop_index("ix_farm_activities_date", table_name="farm_activities")
    op.drop_index("ix_farm_activities_farm_id", table_name="farm_activities")
    op.drop_table("farm_activities")
    op.execute("DROP TYPE IF EXISTS activitytype")
