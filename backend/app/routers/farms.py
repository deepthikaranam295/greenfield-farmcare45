import logging
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut
from app.schemas.task import TaskOut
from app.schemas.report import ReportOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import farm_service, task_service, report_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.farm import Farm
from app.models.task import Task, TaskStatus
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.farms")

router = APIRouter(prefix="/api/farms", tags=["Farms"])


def _task_to_out(task: Task) -> TaskOut:
    return TaskOut(
        id=task.id,
        task_number=task.task_number,
        task_name=task.task_name,
        farm_id=task.farm_id,
        customer_id=task.customer_id,
        assigned_to=task.assigned_to,
        task_type=task.task_type,
        status=task.status,
        priority=task.priority,
        planned_start_date=task.planned_start_date,
        planned_end_date=task.planned_end_date,
        actual_start_date=task.actual_start_date,
        actual_end_date=task.actual_end_date,
        delay_days=task.delay_days,
        notes=task.notes,
        created_at=task.created_at,
        updated_at=task.updated_at,
        customer_name=task.customer.name if task.customer else None,
        farm_name=task.farm.name if task.farm else None,
        assigned_field_team_name=task.assignee.name if task.assignee else None,
    )


@router.post("", response_model=APIResponse[FarmOut])
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    logger.info("POST /api/farms: user_id=%s name=%s", current_user.id, payload.name)
    farm = farm_service.create_farm(db, payload)
    logger.info("POST /api/farms: success farm_id=%s", farm.id)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.get("/summary")
def farms_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    p: Pagination = Depends(),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("name"),
):
    logger.info("GET /api/farms/summary: user_id=%s search=%s page=%d", current_user.id, search, p.page)

    q = db.query(Farm, User.name.label("customer_name"))\
          .outerjoin(User, Farm.customer_id == User.id)\
          .filter(Farm.is_deleted == False)

    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(
            Farm.name.ilike(term),
            User.name.ilike(term),
            Farm.district.ilike(term),
        ))

    total = q.count()

    if sort_by == "customer":
        q = q.order_by(User.name.asc(), Farm.name.asc())
    elif sort_by == "status":
        q = q.order_by(Farm.status.asc(), Farm.name.asc())
    else:
        q = q.order_by(Farm.name.asc())

    rows = q.offset(p.skip).limit(p.size).all()
    farm_ids = [farm.id for farm, _ in rows]

    task_stats = {}
    if farm_ids:
        raw = db.query(
            Task.farm_id,
            Task.status,
            func.count(Task.id).label("cnt"),
            func.max(Task.updated_at).label("last_updated"),
        ).filter(
            Task.farm_id.in_(farm_ids),
            Task.is_deleted == False,
        ).group_by(Task.farm_id, Task.status).all()

        for row in raw:
            fid = row.farm_id
            if fid not in task_stats:
                task_stats[fid] = {"active_tasks": 0, "pending_tasks": 0, "last_activity": None}
            if row.status in (TaskStatus.pending, TaskStatus.in_progress):
                task_stats[fid]["active_tasks"] += row.cnt
            if row.status == TaskStatus.pending:
                task_stats[fid]["pending_tasks"] += row.cnt
            lu = row.last_updated
            if lu and (task_stats[fid]["last_activity"] is None or lu > task_stats[fid]["last_activity"]):
                task_stats[fid]["last_activity"] = lu

    data = []
    for farm, customer_name in rows:
        stats = task_stats.get(farm.id, {"active_tasks": 0, "pending_tasks": 0, "last_activity": None})
        la = stats["last_activity"]
        data.append({
            "id": str(farm.id),
            "name": farm.name,
            "customer_name": customer_name or "—",
            "district": farm.district,
            "status": farm.status.value,
            "subscription_plan": farm.subscription_plan.value,
            "size_acres": farm.size_acres,
            "active_tasks": stats["active_tasks"],
            "pending_tasks": stats["pending_tasks"],
            "last_activity": la.date().isoformat() if la else None,
        })

    pages = max(1, -(-total // p.size))
    logger.info("GET /api/farms/summary: total=%d pages=%d", total, pages)
    return {"status": "success", "data": data, "total": total, "page": p.page, "size": p.size, "pages": pages}


@router.get("", response_model=PaginatedResponse[FarmOut])
def list_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
    customer_id: Optional[uuid.UUID] = Query(None, description="Admin only: filter farms by customer"),
):
    logger.info(
        "GET /api/farms: user_id=%s include_deleted=%s page=%d size=%d customer_id=%s",
        current_user.id, include_deleted, p.page, p.size, customer_id,
    )
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    if customer_id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can filter farms by customer")
    farms, total = farm_service.list_farms(
        db, current_user, skip=p.skip, limit=p.size,
        include_deleted=include_deleted, customer_id=customer_id,
    )
    logger.info("GET /api/farms: returning total=%d", total)
    return PaginatedResponse(
        data=[FarmOut.model_validate(f) for f in farms],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{farm_id}", response_model=APIResponse[FarmOut])
def get_farm(farm_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("GET /api/farms/%s: user_id=%s", farm_id, current_user.id)
    farm = farm_service.get_farm(db, farm_id, current_user)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.put("/{farm_id}", response_model=APIResponse[FarmOut])
def update_farm(
    farm_id: uuid.UUID,
    payload: FarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("PUT /api/farms/%s: user_id=%s", farm_id, current_user.id)
    farm = farm_service.update_farm(db, farm_id, payload, current_user)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.delete("/{farm_id}", response_model=APIResponse)
def delete_farm(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("DELETE /api/farms/%s: user_id=%s", farm_id, current_user.id)
    farm_service.delete_farm(db, farm_id, current_user)
    return APIResponse.ok(message="Farm deleted")


@router.get("/{farm_id}/tasks", response_model=PaginatedResponse[TaskOut])
def farm_tasks(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/farms/%s/tasks: user_id=%s", farm_id, current_user.id)
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    farm_service.get_farm(db, farm_id, current_user)
    tasks, total = task_service.get_farm_tasks(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    return PaginatedResponse(
        data=[_task_to_out(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{farm_id}/reports", response_model=PaginatedResponse[ReportOut])
def farm_reports(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/farms/%s/reports: user_id=%s", farm_id, current_user.id)
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    farm_service.get_farm(db, farm_id, current_user)
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )
