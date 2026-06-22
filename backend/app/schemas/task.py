import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.models.task import TaskType, TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    task_name: Optional[str] = None
    farm_id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    priority: Optional[TaskPriority] = TaskPriority.medium
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    task_name: Optional[str] = None
    customer_id: Optional[uuid.UUID] = None
    assigned_to: Optional[uuid.UUID] = None
    task_type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[TaskStatus] = None


class ServiceRequestCreate(BaseModel):
    farm_id: uuid.UUID
    task_type: TaskType
    notes: Optional[str] = None
    planned_start_date: Optional[date] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    task_number: Optional[int] = None
    task_name: Optional[str] = None
    farm_id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    assigned_to: Optional[uuid.UUID] = None
    task_type: TaskType
    status: TaskStatus
    priority: Optional[TaskPriority] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    delay_days: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Enriched from joins — populated by _task_to_out() in router
    customer_name: Optional[str] = None
    farm_name: Optional[str] = None
    assigned_field_team_name: Optional[str] = None

    model_config = {"from_attributes": True}
