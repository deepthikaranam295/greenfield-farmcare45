import logging
import uuid
from datetime import datetime, timezone, date as date_type
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import case, or_
from fastapi import HTTPException
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.user import User, UserRole
from app.models.farm import Farm
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, ServiceRequestCreate

logger = logging.getLogger("app.services.task")


def _with_relations(q):
    """Attach eager-load options for farm, customer, assignee."""
    return q.options(
        joinedload(Task.farm),
        joinedload(Task.customer),
        joinedload(Task.assignee),
    )


def _reload(db: Session, task_id) -> Task:
    """Reload a single task with all relationships after a write."""
    return _with_relations(db.query(Task)).filter(Task.id == task_id).first()


def create_task(db: Session, payload: TaskCreate, current_user: User) -> Task:
    logger.info("create_task: farm_id=%s type=%s", payload.farm_id, payload.task_type)
    data = payload.model_dump()
    planned_start = data.pop("planned_start_date", None)
    task = Task(**data)
    task.planned_start_date = planned_start
    task.scheduled_date = planned_start
    task.status = TaskStatus.pending
    db.add(task)
    db.commit()
    logger.info("create_task: success task_id=%s", task.id)
    return _reload(db, task.id)


def create_service_request(db: Session, payload: ServiceRequestCreate, current_user: User) -> Task:
    logger.info("create_service_request: user_id=%s farm_id=%s type=%s", current_user.id, payload.farm_id, payload.task_type)
    task = Task(
        farm_id=payload.farm_id,
        customer_id=current_user.id,
        task_type=payload.task_type,
        task_name=payload.notes,
        notes=payload.notes,
        planned_start_date=payload.planned_start_date,
        scheduled_date=payload.planned_start_date,
        status=TaskStatus.requested,
        priority=TaskPriority.medium,
    )
    db.add(task)
    db.commit()
    logger.info("create_service_request: success task_id=%s", task.id)
    return _reload(db, task.id)


def get_task(db: Session, task_id: uuid.UUID, current_user: User) -> Task:
    logger.info("get_task: task_id=%s user_id=%s", task_id, current_user.id)
    task = _with_relations(db.query(Task)).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.field_team and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == UserRole.customer and task.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task


def update_task(db: Session, task_id: uuid.UUID, payload: TaskUpdate, current_user: User) -> Task:
    logger.info("update_task: task_id=%s user_id=%s", task_id, current_user.id)
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updates = payload.model_dump(exclude_unset=True)
    if "planned_start_date" in updates:
        task.scheduled_date = updates["planned_start_date"]
    for field, value in updates.items():
        setattr(task, field, value)
    db.commit()
    logger.info("update_task: success task_id=%s", task_id)
    return _reload(db, task.id)


def update_task_status(db: Session, task_id: uuid.UUID, payload: TaskStatusUpdate, current_user: User) -> Task:
    logger.info("update_task_status: task_id=%s user_id=%s status=%s", task_id, current_user.id, payload.status)
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.field_team and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == UserRole.customer and task.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == UserRole.field_team and payload.status not in (
        TaskStatus.pending, TaskStatus.in_progress, TaskStatus.completed
    ):
        raise HTTPException(status_code=403, detail="Field team can only set pending, in_progress, or completed")

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
    logger.info("update_task_status: success task_id=%s", task.id)
    return _reload(db, task.id)


def get_my_tasks(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
    sort_by: str = "planned_end_date",
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    customer_id_filter: Optional[uuid.UUID] = None,
    farm_id_filter: Optional[uuid.UUID] = None,
    assigned_to_filter: Optional[uuid.UUID] = None,
    priority_filter: Optional[str] = None,
) -> tuple[list[Task], int]:
    logger.info("get_my_tasks: user_id=%s role=%s search=%s", current_user.id, current_user.role, search)
    q = _with_relations(db.query(Task))

    if current_user.role == UserRole.admin:
        q = q.filter(Task.status != TaskStatus.requested)
    elif current_user.role == UserRole.field_team:
        q = q.filter(Task.assigned_to == current_user.id)

    if not include_deleted:
        q = q.filter(Task.is_deleted == False)
    if status_filter:
        q = q.filter(Task.status == status_filter)
    if customer_id_filter:
        q = q.filter(Task.customer_id == customer_id_filter)
    if farm_id_filter:
        q = q.filter(Task.farm_id == farm_id_filter)
    if assigned_to_filter:
        q = q.filter(Task.assigned_to == assigned_to_filter)
    if priority_filter:
        q = q.filter(Task.priority == priority_filter)
    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(
            Task.task_name.ilike(term),
            Task.farm.has(Farm.name.ilike(term)),
            Task.customer.has(User.name.ilike(term)),
            Task.assignee.has(User.name.ilike(term)),
        ))

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
    elif sort_by == "planned_start_date":
        q = q.order_by(Task.planned_start_date.asc().nulls_last())
    else:
        q = q.order_by(Task.planned_end_date.asc().nulls_last(), priority_order)

    # Count without joinedload to avoid duplicate rows
    count_q = db.query(Task)
    if current_user.role == UserRole.admin:
        count_q = count_q.filter(Task.status != TaskStatus.requested)
    elif current_user.role == UserRole.field_team:
        count_q = count_q.filter(Task.assigned_to == current_user.id)
    if not include_deleted:
        count_q = count_q.filter(Task.is_deleted == False)
    if status_filter:
        count_q = count_q.filter(Task.status == status_filter)
    if customer_id_filter:
        count_q = count_q.filter(Task.customer_id == customer_id_filter)
    if farm_id_filter:
        count_q = count_q.filter(Task.farm_id == farm_id_filter)
    if assigned_to_filter:
        count_q = count_q.filter(Task.assigned_to == assigned_to_filter)
    if priority_filter:
        count_q = count_q.filter(Task.priority == priority_filter)
    if search:
        term = f"%{search.strip()}%"
        count_q = count_q.filter(or_(
            Task.task_name.ilike(term),
            Task.farm.has(Farm.name.ilike(term)),
            Task.customer.has(User.name.ilike(term)),
            Task.assignee.has(User.name.ilike(term)),
        ))
    total = count_q.count()

    logger.info("get_my_tasks: total=%d", total)
    return q.offset(skip).limit(limit).all(), total


def get_service_requests(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Task], int]:
    q = _with_relations(db.query(Task)).filter(
        Task.status == TaskStatus.requested,
        Task.is_deleted == False,
    ).order_by(Task.created_at.desc())
    total = db.query(Task).filter(Task.status == TaskStatus.requested, Task.is_deleted == False).count()
    return q.offset(skip).limit(limit).all(), total


def get_customer_tasks(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
) -> tuple[list[Task], int]:
    q = _with_relations(db.query(Task)).filter(
        Task.customer_id == current_user.id,
        Task.is_deleted == False,
    )
    if status_filter:
        q = q.filter(Task.status == status_filter)
    q = q.order_by(Task.created_at.desc())
    count_q = db.query(Task).filter(Task.customer_id == current_user.id, Task.is_deleted == False)
    if status_filter:
        count_q = count_q.filter(Task.status == status_filter)
    total = count_q.count()
    return q.offset(skip).limit(limit).all(), total


def get_farm_tasks(
    db: Session,
    farm_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
) -> tuple[list[Task], int]:
    logger.info("get_farm_tasks: farm_id=%s", farm_id)
    q = _with_relations(db.query(Task)).filter(Task.farm_id == farm_id)
    if not include_deleted:
        q = q.filter(Task.is_deleted == False)
    count_q = db.query(Task).filter(Task.farm_id == farm_id)
    if not include_deleted:
        count_q = count_q.filter(Task.is_deleted == False)
    total = count_q.count()
    return q.offset(skip).limit(limit).all(), total


def delete_task(db: Session, task_id: uuid.UUID, current_user: User) -> None:
    logger.info("delete_task: task_id=%s user_id=%s", task_id, current_user.id)
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_deleted = True
    task.deleted_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("delete_task: soft-deleted task_id=%s", task_id)
