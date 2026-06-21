import logging
import uuid
from datetime import datetime, timezone, date as date_type
from sqlalchemy.orm import Session
from sqlalchemy import case
from fastapi import HTTPException
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskStatusUpdate

logger = logging.getLogger("app.services.task")


def create_task(db: Session, payload: TaskCreate) -> Task:
    logger.info("create_task: farm_id=%s type=%s", payload.farm_id, payload.task_type)
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    logger.info("create_task: success task_id=%s", task.id)
    return task


def get_task(db: Session, task_id: uuid.UUID, current_user: User) -> Task:
    logger.info("get_task: task_id=%s user_id=%s", task_id, current_user.id)
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        logger.warning("get_task: not found task_id=%s", task_id)
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.field_team and task.assigned_to != current_user.id:
        logger.warning("get_task: access denied task_id=%s user_id=%s", task_id, current_user.id)
        raise HTTPException(status_code=403, detail="Access denied")
    logger.info("get_task: found task_id=%s", task.id)
    return task


def update_task_status(db: Session, task_id: uuid.UUID, payload: TaskStatusUpdate, current_user: User) -> Task:
    logger.info("update_task_status: task_id=%s user_id=%s status=%s", task_id, current_user.id, payload.status)
    task = get_task(db, task_id, current_user)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    today = date_type.today()
    if task.status == TaskStatus.in_progress and not task.actual_start_date:
        task.actual_start_date = today
    if task.status == TaskStatus.completed:
        if not task.actual_end_date:
            task.actual_end_date = today
        if not task.actual_start_date:
            task.actual_start_date = task.actual_end_date
        if task.planned_end_date and task.actual_end_date:
            task.delay_days = (task.actual_end_date - task.planned_end_date).days

    db.commit()
    db.refresh(task)
    logger.info("update_task_status: success task_id=%s", task.id)
    return task


def get_my_tasks(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
    sort_by: str = "planned_end_date",
    status_filter: str = None,
) -> tuple[list[Task], int]:
    logger.info(
        "get_my_tasks: user_id=%s role=%s skip=%d limit=%d sort_by=%s",
        current_user.id, current_user.role, skip, limit, sort_by,
    )
    q = db.query(Task)
    if current_user.role != UserRole.admin:
        q = q.filter(Task.assigned_to == current_user.id)
    if not include_deleted:
        q = q.filter(Task.is_deleted == False)
    if status_filter:
        q = q.filter(Task.status == status_filter)

    priority_order = case(
        (Task.priority == TaskPriority.high, 1),
        (Task.priority == TaskPriority.medium, 2),
        (Task.priority == TaskPriority.low, 3),
        else_=4,
    )
    if sort_by == "priority":
        q = q.order_by(priority_order, Task.planned_end_date.asc().nulls_last())
    elif sort_by == "status":
        q = q.order_by(Task.status.asc(), Task.planned_end_date.asc().nulls_last())
    elif sort_by == "scheduled_date":
        q = q.order_by(Task.scheduled_date.asc().nulls_last())
    else:
        q = q.order_by(Task.planned_end_date.asc().nulls_last(), priority_order)

    total = q.count()
    logger.info("get_my_tasks: returning total=%d", total)
    return q.offset(skip).limit(limit).all(), total


def get_farm_tasks(
    db: Session,
    farm_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
) -> tuple[list[Task], int]:
    logger.info(
        "get_farm_tasks: farm_id=%s skip=%d limit=%d include_deleted=%s",
        farm_id, skip, limit, include_deleted,
    )
    q = db.query(Task).filter(Task.farm_id == farm_id)
    if not include_deleted:
        q = q.filter(Task.is_deleted == False)
    total = q.count()
    logger.info("get_farm_tasks: returning total=%d", total)
    return q.offset(skip).limit(limit).all(), total


def delete_task(db: Session, task_id: uuid.UUID, current_user: User) -> None:
    logger.info("delete_task: task_id=%s user_id=%s", task_id, current_user.id)
    task = get_task(db, task_id, current_user)
    task.is_deleted = True
    task.deleted_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("delete_task: soft-deleted task_id=%s", task_id)
