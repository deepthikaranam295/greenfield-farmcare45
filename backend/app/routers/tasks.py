import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskStatusUpdate, TaskOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import task_service
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_field
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.tasks")

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=APIResponse[TaskOut])
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    logger.info("POST /api/tasks: user_id=%s type=%s", current_user.id, payload.task_type)
    task = task_service.create_task(db, payload)
    logger.info("POST /api/tasks: success task_id=%s", task.id)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.get("/my-tasks", response_model=PaginatedResponse[TaskOut])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info(
        "GET /api/tasks/my-tasks: user_id=%s include_deleted=%s page=%d size=%d",
        current_user.id, include_deleted, p.page, p.size,
    )
    if include_deleted and current_user.role != UserRole.admin:
        logger.warning("GET /api/tasks/my-tasks: non-admin requested include_deleted user_id=%s", current_user.id)
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    tasks, total = task_service.get_my_tasks(db, current_user, p.skip, p.size, include_deleted=include_deleted)
    logger.info("GET /api/tasks/my-tasks: returning total=%d", total)
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{task_id}", response_model=APIResponse[TaskOut])
def get_task(task_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("GET /api/tasks/%s: user_id=%s", task_id, current_user.id)
    task = task_service.get_task(db, task_id, current_user)
    logger.info("GET /api/tasks/%s: success", task_id)
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
    logger.info("PUT /api/tasks/%s/status: success", task_id)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.delete("/{task_id}", response_model=APIResponse)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("DELETE /api/tasks/%s: user_id=%s", task_id, current_user.id)
    task_service.delete_task(db, task_id, current_user)
    logger.info("DELETE /api/tasks/%s: success", task_id)
    return APIResponse.ok(message="Task deleted")
