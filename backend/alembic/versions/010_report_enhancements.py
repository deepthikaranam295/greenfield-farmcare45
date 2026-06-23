"""Add observations, recommendations, report_number to field_reports; extend status enum

Revision ID: 010
Revises: 009
Create Date: 2026-06-22
"""
from alembic import op
from sqlalchemy import text

revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ALTER TYPE ADD VALUE cannot be used in the same transaction as INSERTs
    # with those new values. Commit first, then add outside any transaction.
    conn = op.get_bind()
    conn.execute(text("COMMIT"))
    conn.execute(text("ALTER TYPE reportstatus ADD VALUE IF NOT EXISTS 'completed'"))
    conn.execute(text("ALTER TYPE reportstatus ADD VALUE IF NOT EXISTS 'follow_up_required'"))
    conn.execute(text("BEGIN"))

    # New columns
    op.execute("ALTER TABLE field_reports ADD COLUMN IF NOT EXISTS observations TEXT")
    op.execute("ALTER TABLE field_reports ADD COLUMN IF NOT EXISTS recommendations TEXT")
    op.execute("ALTER TABLE field_reports ADD COLUMN IF NOT EXISTS report_number BIGINT")

    # Back-fill report_number for any existing rows
    op.execute("""
        WITH ranked AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
            FROM field_reports WHERE report_number IS NULL
        )
        UPDATE field_reports SET report_number = ranked.rn
        FROM ranked WHERE field_reports.id = ranked.id
    """)

    # Sequence for auto-incrementing report_number
    op.execute("CREATE SEQUENCE IF NOT EXISTS field_reports_report_number_seq")
    op.execute(
        "SELECT setval('field_reports_report_number_seq', "
        "COALESCE((SELECT MAX(report_number) FROM field_reports), 0))"
    )
    op.execute(
        "ALTER TABLE field_reports ALTER COLUMN report_number "
        "SET DEFAULT nextval('field_reports_report_number_seq')"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE field_reports ALTER COLUMN report_number DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS field_reports_report_number_seq")
    op.execute("ALTER TABLE field_reports DROP COLUMN IF EXISTS recommendations")
    op.execute("ALTER TABLE field_reports DROP COLUMN IF EXISTS observations")
    op.execute("ALTER TABLE field_reports DROP COLUMN IF EXISTS report_number")
