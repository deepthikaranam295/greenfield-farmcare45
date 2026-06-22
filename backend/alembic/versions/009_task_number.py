"""Add task_number sequential column

Revision ID: 009
Revises: 008
Create Date: 2026-06-22
"""
from alembic import op

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_number BIGINT")
    op.execute("""
        WITH ranked AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
            FROM tasks
            WHERE task_number IS NULL
        )
        UPDATE tasks SET task_number = ranked.rn FROM ranked WHERE tasks.id = ranked.id
    """)
    op.execute("CREATE SEQUENCE IF NOT EXISTS tasks_task_number_seq")
    op.execute("SELECT setval('tasks_task_number_seq', COALESCE((SELECT MAX(task_number) FROM tasks), 0))")
    op.execute("ALTER TABLE tasks ALTER COLUMN task_number SET DEFAULT nextval('tasks_task_number_seq')")


def downgrade() -> None:
    op.execute("ALTER TABLE tasks ALTER COLUMN task_number DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS tasks_task_number_seq")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS task_number")
