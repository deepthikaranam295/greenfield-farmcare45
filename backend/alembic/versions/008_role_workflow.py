"""Role simplification and task workflow fields

Revision ID: 008
Revises: 007
"""
from alembic import op
import sqlalchemy as sa

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 'requested' to taskstatus enum (customer service requests)
    op.execute("ALTER TYPE taskstatus ADD VALUE IF NOT EXISTS 'requested'")

    # New task columns
    op.add_column("tasks", sa.Column("task_name", sa.String(200), nullable=True))
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE SET NULL")
    op.add_column("tasks", sa.Column("planned_start_date", sa.Date(), nullable=True))

    # Back-fill planned_start_date from scheduled_date
    op.execute("UPDATE tasks SET planned_start_date = scheduled_date WHERE scheduled_date IS NOT NULL")

    # Back-fill customer_id from farm's customer
    op.execute("""
        UPDATE tasks t
        SET customer_id = f.customer_id
        FROM farms f
        WHERE t.farm_id = f.id AND t.customer_id IS NULL AND f.customer_id IS NOT NULL
    """)

    # Migrate removed roles → customer
    op.execute("UPDATE users SET role = 'customer' WHERE role IN ('farm_owner', 'farm_worker')")

    # Recreate userrole enum with only 3 values
    op.execute("CREATE TYPE userrole_v2 AS ENUM ('admin', 'field_team', 'customer')")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole_v2 USING role::text::userrole_v2")
    op.execute("DROP TYPE userrole")
    op.execute("ALTER TYPE userrole_v2 RENAME TO userrole")


def downgrade() -> None:
    op.execute("CREATE TYPE userrole_old AS ENUM ('admin', 'field_team', 'farm_owner', 'farm_worker', 'customer')")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole_old USING role::text::userrole_old")
    op.execute("DROP TYPE userrole")
    op.execute("ALTER TYPE userrole_old RENAME TO userrole")
    op.drop_column("tasks", "planned_start_date")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS customer_id")
    op.drop_column("tasks", "task_name")
