import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut
from app.schemas.task import TaskOut
from app.schemas.report import ReportOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import farm_service, task_service, report_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.utils.pagination import Pagination

router = APIRouter(prefix="/api/farms", tags=["Farms"])


@router.post("", response_model=APIResponse[FarmOut])
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    farm = farm_service.create_farm(db, payload)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.get("", response_model=PaginatedResponse[FarmOut])
def list_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
):
    farms, total = farm_service.list_farms(db, current_user, skip=p.skip, limit=p.size)
    return PaginatedResponse(
        data=[FarmOut.model_validate(f) for f in farms],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{farm_id}", response_model=APIResponse[FarmOut])
def get_farm(farm_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = farm_service.get_farm(db, farm_id, current_user)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.put("/{farm_id}", response_model=APIResponse[FarmOut])
def update_farm(farm_id: uuid.UUID, payload: FarmUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    farm = farm_service.update_farm(db, farm_id, payload, current_user)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.get("/{farm_id}/tasks", response_model=PaginatedResponse[TaskOut])
def farm_tasks(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
):
    farm_service.get_farm(db, farm_id, current_user)
    tasks, total = task_service.get_farm_tasks(db, farm_id, p.skip, p.size)
    return PaginatedResponse(
        data=[TaskOut.model_validate(t) for t in tasks],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{farm_id}/reports", response_model=PaginatedResponse[ReportOut])
def farm_reports(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
):
    farm_service.get_farm(db, farm_id, current_user)
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )
