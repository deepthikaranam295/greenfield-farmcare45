import logging
import uuid
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.report import ReportCreate, ReportOut, ReportPhotoOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import report_service, farm_service
from app.dependencies.auth import get_current_user, require_admin_or_field, require_admin
from app.models.user import User, UserRole
from app.models.task import Task, TaskStatus
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.reports")

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/task-performance")
def task_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    farm_id: Optional[uuid.UUID] = Query(None),
    user_id: Optional[uuid.UUID] = Query(None),
    customer_id: Optional[uuid.UUID] = Query(None),
    assigned_to: Optional[uuid.UUID] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    logger.info(
        "GET /api/reports/task-performance: user_id=%s farm_id=%s customer_id=%s date_from=%s date_to=%s",
        current_user.id, farm_id, customer_id, date_from, date_to,
    )
    today = date.today()

    # Resolve assigned_to from either param name
    effective_assigned_to = assigned_to or user_id

    q = db.query(Task).filter(Task.is_deleted == False)

    if farm_id:
        q = q.filter(Task.farm_id == farm_id)
    if customer_id:
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Only admins can filter by customer")
        q = q.filter(Task.customer_id == customer_id)
    if effective_assigned_to:
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Only admins can filter by assigned user")
        q = q.filter(Task.assigned_to == effective_assigned_to)
    elif current_user.role not in (UserRole.admin,):
        q = q.filter(Task.assigned_to == current_user.id)

    if date_from:
        q = q.filter(Task.created_at >= date_from)
    if date_to:
        q = q.filter(Task.created_at <= date_to)

    tasks = q.all()
    completed = [t for t in tasks if t.status == TaskStatus.completed]
    active = [t for t in tasks if t.status not in (TaskStatus.completed, TaskStatus.cancelled, TaskStatus.requested)]
    delay_values = [t.delay_days for t in completed if t.delay_days is not None and t.delay_days > 0]

    # Monthly completion trend — last 12 months
    trend_q = db.query(
        extract("year", Task.actual_end_date).label("yr"),
        extract("month", Task.actual_end_date).label("mo"),
        func.count(Task.id).label("cnt"),
    ).filter(
        Task.status == TaskStatus.completed,
        Task.actual_end_date.isnot(None),
        Task.is_deleted == False,
        Task.actual_end_date >= today - timedelta(days=365),
    )
    if farm_id:
        trend_q = trend_q.filter(Task.farm_id == farm_id)
    if customer_id and current_user.role == UserRole.admin:
        trend_q = trend_q.filter(Task.customer_id == customer_id)
    if effective_assigned_to and current_user.role == UserRole.admin:
        trend_q = trend_q.filter(Task.assigned_to == effective_assigned_to)
    elif current_user.role not in (UserRole.admin,):
        trend_q = trend_q.filter(Task.assigned_to == current_user.id)

    trend_rows = trend_q.group_by("yr", "mo").order_by("yr", "mo").all()

    month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    monthly_trend = [
        {"month": f"{month_names[int(r.mo) - 1]} {int(r.yr)}", "count": r.cnt}
        for r in trend_rows
    ]

    completion_rate = round((len(completed) / len(tasks)) * 100, 1) if tasks else 0

    return {
        "status": "success",
        "data": {
            "total": len(tasks),
            "requested": sum(1 for t in tasks if t.status == TaskStatus.requested),
            "pending": sum(1 for t in tasks if t.status == TaskStatus.pending),
            "in_progress": sum(1 for t in tasks if t.status == TaskStatus.in_progress),
            "completed": len(completed),
            "cancelled": sum(1 for t in tasks if t.status == TaskStatus.cancelled),
            "completed_on_time": sum(1 for t in completed if t.delay_days is not None and t.delay_days <= 0),
            "completed_late": sum(1 for t in completed if t.delay_days is not None and t.delay_days > 0),
            "overdue": sum(1 for t in active if t.planned_end_date and t.planned_end_date < today),
            "due_soon": sum(1 for t in active if t.planned_end_date and today <= t.planned_end_date <= today + timedelta(days=3)),
            "avg_delay_days": round(sum(delay_values) / len(delay_values), 1) if delay_values else 0,
            "completion_rate": completion_rate,
            "monthly_trend": monthly_trend,
        },
    }


@router.post("", response_model=APIResponse[ReportOut])
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("POST /api/reports: user_id=%s farm_id=%s", current_user.id, payload.farm_id)
    report = report_service.create_report(db, payload, current_user)
    return APIResponse.ok(data=ReportOut.model_validate(report))


@router.post("/{report_id}/photos", response_model=APIResponse[ReportPhotoOut])
async def upload_photo(
    report_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("POST /api/reports/%s/photos: user_id=%s", report_id, current_user.id)
    photo = await report_service.add_photo(db, report_id, file, caption, current_user)
    return APIResponse.ok(data=ReportPhotoOut.model_validate(photo))


@router.get("/farm/{farm_id}", response_model=PaginatedResponse[ReportOut])
def farm_reports(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/reports/farm/%s: user_id=%s", farm_id, current_user.id)
    farm_service.get_farm(db, farm_id, current_user)
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{report_id}", response_model=APIResponse[ReportOut])
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("GET /api/reports/%s: user_id=%s", report_id, current_user.id)
    report = report_service.get_report(db, report_id, current_user)
    return APIResponse.ok(data=ReportOut.model_validate(report))


@router.delete("/{report_id}", response_model=APIResponse)
def delete_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("DELETE /api/reports/%s: user_id=%s", report_id, current_user.id)
    report_service.delete_report(db, report_id, current_user)
    return APIResponse.ok(message="Report deleted")
