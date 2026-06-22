import logging
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskOut, ServiceRequestCreate
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import task_service
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_field, require_customer
from app.models.user import User, UserRole
from app.models.task import Task
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.tasks")

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _task_to_out(task: Task) -> TaskOut:
    """Convert ORM task (with eager-loaded relations) to TaskOut schema."""
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


@router.post("", response_model=APIResponse[TaskOut])
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("POST /api/tasks: user_id=%s type=%s", current_user.id, payload.task_type)
    task = task_service.create_task(db, payload, current_user)
    return APIResponse.ok(data=_task_to_out(task))


@router.put("/{task_id}", response_model=APIResponse[TaskOut])
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("PUT /api/tasks/%s: user_id=%s", task_id, current_user.id)
    task = task_service.update_task(db, task_id, payload, current_user)
    return APIResponse.ok(data=_task_to_out(task))


@router.get("/my-tasks", response_model=PaginatedResponse[TaskOut])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
    sort_by: str = Query("planned_end_date"),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    customer_id: Optional[uuid.UUID] = Query(None),
    farm_id: Optional[uuid.UUID] = Query(None),
    assigned_to: Optional[uuid.UUID] = Query(None),
    priority: Optional[str] = Query(None),
):
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    tasks, total = task_service.get_my_tasks(
        db, current_user, p.skip, p.size,
        include_deleted=include_deleted,
        sort_by=sort_by,
        status_filter=status_filter,
        search=search,
        customer_id_filter=customer_id,
        farm_id_filter=farm_id,
        assigned_to_filter=assigned_to,
        priority_filter=priority,
    )
    return PaginatedResponse(
        data=[_task_to_out(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/service-requests", response_model=PaginatedResponse[TaskOut])
def list_service_requests(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    p: Pagination = Depends(),
):
    tasks, total = task_service.get_service_requests(db, p.skip, p.size)
    return PaginatedResponse(
        data=[_task_to_out(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.post("/service-requests", response_model=APIResponse[TaskOut])
def create_service_request(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    logger.info("POST /api/tasks/service-requests: user_id=%s type=%s", current_user.id, payload.task_type)
    task = task_service.create_service_request(db, payload, current_user)
    return APIResponse.ok(data=_task_to_out(task), message="Service request submitted successfully")


@router.get("/customer-tasks", response_model=PaginatedResponse[TaskOut])
def customer_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
    p: Pagination = Depends(),
    status_filter: Optional[str] = Query(None),
):
    tasks, total = task_service.get_customer_tasks(db, current_user, p.skip, p.size, status_filter)
    return PaginatedResponse(
        data=[_task_to_out(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{task_id}", response_model=APIResponse[TaskOut])
def get_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_service.get_task(db, task_id, current_user)
    return APIResponse.ok(data=_task_to_out(task))


@router.put("/{task_id}/status", response_model=APIResponse[TaskOut])
def update_task_status(
    task_id: uuid.UUID,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("PUT /api/tasks/%s/status: user_id=%s status=%s", task_id, current_user.id, payload.status)
    task = task_service.update_task_status(db, task_id, payload, current_user)
    return APIResponse.ok(data=_task_to_out(task))


@router.delete("/{task_id}", response_model=APIResponse)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    task_service.delete_task(db, task_id, current_user)
    return APIResponse.ok(message="Task deleted")
