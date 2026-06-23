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
    observations: Optional[str] = None
    recommendations: Optional[str] = None
    issues_found: Optional[str] = None
    next_visit_needed: bool = False
    status: Optional[ReportStatus] = None


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
    report_number: Optional[int] = None
    task_id: Optional[uuid.UUID] = None
    farm_id: uuid.UUID
    submitted_by: uuid.UUID
    visit_date: date
    arrival_time: Optional[time] = None
    departure_time: Optional[time] = None
    work_done: Optional[str] = None
    observations: Optional[str] = None
    recommendations: Optional[str] = None
    status: ReportStatus
    issues_found: Optional[str] = None
    next_visit_needed: bool
    photos: list[ReportPhotoOut] = []
    created_at: datetime
    updated_at: datetime

    # Enriched — populated by _report_to_out() in the router
    submitted_by_name: Optional[str] = None
    farm_name: Optional[str] = None
    customer_name: Optional[str] = None
    task_type: Optional[str] = None
    task_name: Optional[str] = None

    model_config = {"from_attributes": True}
