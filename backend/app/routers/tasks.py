import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskStatusUpdate, TaskOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import task_service
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_field
from app.models.user import User
from app.utils.pagination import Pagination

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=APIResponse[TaskOut])
def create_task(payload: TaskCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    task = task_service.create_task(db, payload)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.get("/my-tasks", response_model=PaginatedResponse[TaskOut])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
    p: Pagination = Depends(),
):
    tasks, total = task_service.get_my_tasks(db, current_user, p.skip, p.size)
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{task_id}", response_model=APIResponse[TaskOut])
def get_task(task_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = task_service.get_task(db, task_id, current_user)
    return APIResponse.ok(data=TaskOut.model_validate(task))


@router.put("/{task_id}/status", response_model=APIResponse[TaskOut])
def update_task_status(
    task_id: uuid.UUID,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    task = task_service.update_task_status(db, task_id, payload, current_user)
    return APIResponse.ok(data=TaskOut.model_validate(task))
