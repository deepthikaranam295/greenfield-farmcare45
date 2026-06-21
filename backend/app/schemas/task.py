import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.models.task import TaskType, TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    farm_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    priority: Optional[TaskPriority] = TaskPriority.medium
    scheduled_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    notes: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    completed_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    status: TaskStatus
    priority: Optional[TaskPriority] = None
    scheduled_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    delay_days: Optional[int] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
