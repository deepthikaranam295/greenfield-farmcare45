import uuid
from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel
from app.models.report import ReportStatus


class ReportCreate(BaseModel):
    task_id: Optional[uuid.UUID] = None
    farm_id: uuid.UUID
    visit_date: date
    arrival_time: Optional[time] = None
    departure_time: Optional[time] = None
    work_done: Optional[str] = None
    issues_found: Optional[str] = None
    next_visit_needed: bool = False


class ReportPhotoOut(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    s3_url: str
    caption: Optional[str] = None
    taken_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportOut(BaseModel):
    id: uuid.UUID
    task_id: Optional[uuid.UUID] = None
    farm_id: uuid.UUID
    submitted_by: uuid.UUID
    visit_date: date
    arrival_time: Optional[time] = None
    departure_time: Optional[time] = None
    work_done: Optional[str] = None
    status: ReportStatus
    issues_found: Optional[str] = None
    next_visit_needed: bool
    photos: list[ReportPhotoOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
