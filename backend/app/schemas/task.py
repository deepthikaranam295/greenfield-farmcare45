import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.models.task import TaskType, TaskStatus


class TaskCreate(BaseModel):
    farm_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    completed_date: Optional[date] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    status: TaskStatus
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
