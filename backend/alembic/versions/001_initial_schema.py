"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(20)),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("admin", "field_team", "customer", name="userrole"), nullable=False, server_default="customer"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "farms",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("village", sa.String(100)),
        sa.Column("mandal", sa.String(100)),
        sa.Column("district", sa.String(100)),
        sa.Column("size_acres", sa.Float),
        sa.Column("gps_lat", sa.Float),
        sa.Column("gps_lng", sa.Float),
        sa.Column("status", sa.Enum("active", "inactive", "pending", name="farmstatus"), server_default="active"),
        sa.Column("subscription_plan", sa.Enum("basic", "standard", "premium", "none", name="subscriptionplan"), server_default="none"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_farms_customer_id", "farms", ["customer_id"])

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farm_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farms.id"), nullable=False),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("task_type", sa.Enum("soil_test","irrigation","fertilization","pest_control","harvesting","inspection","other", name="tasktype"), nullable=False),
        sa.Column("status", sa.Enum("pending","in_progress","completed","cancelled", name="taskstatus"), server_default="pending"),
        sa.Column("scheduled_date", sa.Date),
        sa.Column("completed_date", sa.Date),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_tasks_farm_id", "tasks", ["farm_id"])

    op.create_table(
        "field_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("task_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tasks.id")),
        sa.Column("farm_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farms.id"), nullable=False),
        sa.Column("submitted_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("visit_date", sa.Date, nullable=False),
        sa.Column("arrival_time", sa.Time),
        sa.Column("departure_time", sa.Time),
        sa.Column("work_done", sa.Text),
        sa.Column("status", sa.Enum("draft","submitted","reviewed", name="reportstatus"), server_default="draft"),
        sa.Column("issues_found", sa.Text),
        sa.Column("next_visit_needed", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_field_reports_farm_id", "field_reports", ["farm_id"])

    op.create_table(
        "report_photos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("field_reports.id"), nullable=False),
        sa.Column("s3_url", sa.String(500), nullable=False),
        sa.Column("caption", sa.String(255)),
        sa.Column("taken_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_report_photos_report_id", "report_photos", ["report_id"])

    op.create_table(
        "vendors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("service_type", sa.String(100)),
        sa.Column("contact_name", sa.String(100)),
        sa.Column("phone", sa.String(20)),
        sa.Column("email", sa.String(255)),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "vendor_orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("task_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tasks.id")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("vendors.id"), nullable=False),
        sa.Column("order_date", sa.Date, nullable=False),
        sa.Column("expected_completion", sa.Date),
        sa.Column("actual_completion", sa.Date),
        sa.Column("vendor_cost", sa.Numeric(10, 2)),
        sa.Column("our_charge", sa.Numeric(10, 2)),
        sa.Column("status", sa.Enum("pending","in_progress","completed","cancelled", name="vendororderstatus"), server_default="pending"),
        sa.Column("sign_off_by", sa.String(100)),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("recipient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("channel", sa.Enum("whatsapp","email","sms","push", name="notificationchannel"), nullable=False),
        sa.Column("message_type", sa.String(100), nullable=False),
        sa.Column("message_body", sa.Text, nullable=False),
        sa.Column("status", sa.Enum("pending","sent","failed", name="notificationstatus"), server_default="pending"),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_recipient_id", "notifications", ["recipient_id"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("vendor_orders")
    op.drop_table("vendors")
    op.drop_table("report_photos")
    op.drop_table("field_reports")
    op.drop_table("tasks")
    op.drop_table("farms")
    op.drop_table("users")

    for enum in ["userrole", "farmstatus", "subscriptionplan", "tasktype", "taskstatus",
                 "reportstatus", "vendororderstatus", "notificationchannel", "notificationstatus"]:
        op.execute(f"DROP TYPE IF EXISTS {enum}")
