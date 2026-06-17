import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.task import Task
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskStatusUpdate


def create_task(db: Session, payload: TaskCreate) -> Task:
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: uuid.UUID, current_user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.field_team and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task


def update_task_status(db: Session, task_id: uuid.UUID, payload: TaskStatusUpdate, current_user: User) -> Task:
    task = get_task(db, task_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def get_my_tasks(db: Session, current_user: User, skip: int = 0, limit: int = 20) -> tuple[list[Task], int]:
    q = db.query(Task).filter(Task.assigned_to == current_user.id)
    total = q.count()
    return q.offset(skip).limit(limit).all(), total


def get_farm_tasks(db: Session, farm_id: uuid.UUID, skip: int = 0, limit: int = 20) -> tuple[list[Task], int]:
    q = db.query(Task).filter(Task.farm_id == farm_id)
    total = q.count()
    return q.offset(skip).limit(limit).all(), total
