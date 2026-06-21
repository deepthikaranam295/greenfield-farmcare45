import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskOut, ServiceRequestCreate
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import task_service
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_field, require_customer
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.tasks")

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=APIResponse[TaskOut])
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("POST /api/tasks: user_id=%s type=%s", current_user.id, payload.task_type)
    task = task_service.create_task(db, payload, current_user)
    logger.info("POST /api/tasks: success task_id=%s", task.id)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.put("/{task_id}", response_model=APIResponse[TaskOut])
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("PUT /api/tasks/%s: user_id=%s", task_id, current_user.id)
    task = task_service.update_task(db, task_id, payload, current_user)
    logger.info("PUT /api/tasks/%s: success", task_id)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.get("/my-tasks", response_model=PaginatedResponse[TaskOut])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
    sort_by: str = Query("planned_end_date"),
    status_filter: str = Query(None),
):
    if include_deleted and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    tasks, total = task_service.get_my_tasks(
        db, current_user, p.skip, p.size,
        include_deleted=include_deleted,
        sort_by=sort_by,
        status_filter=status_filter,
    )
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/service-requests", response_model=PaginatedResponse[TaskOut])
def list_service_requests(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    p: Pagination = Depends(),
):
    """Admin retrieves pending customer service requests."""
    tasks, total = task_service.get_service_requests(db, p.skip, p.size)
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.post("/service-requests", response_model=APIResponse[TaskOut])
def create_service_request(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
):
    """Customer submits a service request."""
    logger.info("POST /api/tasks/service-requests: user_id=%s type=%s", current_user.id, payload.task_type)
    task = task_service.create_service_request(db, payload, current_user)
    return APIResponse.ok(data=TaskOut.model_validate(task), message="Service request submitted successfully")


@router.get("/customer-tasks", response_model=PaginatedResponse[TaskOut])
def customer_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer),
    p: Pagination = Depends(),
    status_filter: str = Query(None),
):
    """Customer retrieves their service requests and farm tasks."""
    tasks, total = task_service.get_customer_tasks(db, current_user, p.skip, p.size, status_filter)
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{task_id}", response_model=APIResponse[TaskOut])
def get_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_service.get_task(db, task_id, current_user)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.put("/{task_id}/status", response_model=APIResponse[TaskOut])
def update_task_status(
    task_id: uuid.UUID,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("PUT /api/tasks/%s/status: user_id=%s status=%s", task_id, current_user.id, payload.status)
    task = task_service.update_task_status(db, task_id, payload, current_user)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.delete("/{task_id}", response_model=APIResponse)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    task_service.delete_task(db, task_id, current_user)
    return APIResponse.ok(message="Task deleted")
