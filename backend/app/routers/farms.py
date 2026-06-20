import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut
from app.schemas.task import TaskOut
from app.schemas.report import ReportOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import farm_service, task_service, report_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.farms")

router = APIRouter(prefix="/api/farms", tags=["Farms"])


@router.post("", response_model=APIResponse[FarmOut])
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    logger.info("POST /api/farms: user_id=%s name=%s", current_user.id, payload.name)
    farm = farm_service.create_farm(db, payload)
    logger.info("POST /api/farms: success farm_id=%s", farm.id)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.get("", response_model=PaginatedResponse[FarmOut])
def list_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info(
        "GET /api/farms: user_id=%s include_deleted=%s page=%d size=%d",
        current_user.id, include_deleted, p.page, p.size,
    )
    if include_deleted and current_user.role != UserRole.admin:
        logger.warning("GET /api/farms: non-admin requested include_deleted user_id=%s", current_user.id)
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    farms, total = farm_service.list_farms(db, current_user, skip=p.skip, limit=p.size, include_deleted=include_deleted)
    logger.info("GET /api/farms: returning total=%d", total)
    return PaginatedResponse(
        data=[FarmOut.model_validate(f) for f in farms],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{farm_id}", response_model=APIResponse[FarmOut])
def get_farm(farm_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("GET /api/farms/%s: user_id=%s", farm_id, current_user.id)
    farm = farm_service.get_farm(db, farm_id, current_user)
    logger.info("GET /api/farms/%s: success", farm_id)
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
    logger.info("PUT /api/farms/%s: success", farm_id)
    return APIResponse.ok(data=FarmOut.model_validate(farm))


@router.delete("/{farm_id}", response_model=APIResponse)
def delete_farm(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("DELETE /api/farms/%s: user_id=%s", farm_id, current_user.id)
    farm_service.delete_farm(db, farm_id, current_user)
    logger.info("DELETE /api/farms/%s: success", farm_id)
    return APIResponse.ok(message="Farm deleted")


@router.get("/{farm_id}/tasks", response_model=PaginatedResponse[TaskOut])
def farm_tasks(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/farms/%s/tasks: user_id=%s include_deleted=%s", farm_id, current_user.id, include_deleted)
    if include_deleted and current_user.role != UserRole.admin:
        logger.warning("GET /api/farms/%s/tasks: non-admin requested include_deleted user_id=%s", farm_id, current_user.id)
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    farm_service.get_farm(db, farm_id, current_user)
    tasks, total = task_service.get_farm_tasks(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    logger.info("GET /api/farms/%s/tasks: returning total=%d", farm_id, total)
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
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/farms/%s/reports: user_id=%s include_deleted=%s", farm_id, current_user.id, include_deleted)
    if include_deleted and current_user.role != UserRole.admin:
        logger.warning("GET /api/farms/%s/reports: non-admin requested include_deleted user_id=%s", farm_id, current_user.id)
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    farm_service.get_farm(db, farm_id, current_user)
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    logger.info("GET /api/farms/%s/reports: returning total=%d", farm_id, total)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )
