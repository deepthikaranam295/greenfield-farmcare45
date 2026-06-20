import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.report import ReportCreate, ReportOut, ReportPhotoOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import report_service, farm_service
from app.dependencies.auth import get_current_user, require_admin_or_field
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.reports")

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("", response_model=APIResponse[ReportOut])
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("POST /api/reports: user_id=%s farm_id=%s", current_user.id, payload.farm_id)
    report = report_service.create_report(db, payload, current_user)
    logger.info("POST /api/reports: success report_id=%s", report.id)
    return APIResponse.ok(data=ReportOut.model_validate(report))


@router.post("/{report_id}/photos", response_model=APIResponse[ReportPhotoOut])
async def upload_photo(
    report_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("POST /api/reports/%s/photos: user_id=%s filename=%s", report_id, current_user.id, file.filename)
    photo = await report_service.add_photo(db, report_id, file, caption, current_user)
    logger.info("POST /api/reports/%s/photos: success photo_id=%s", report_id, photo.id)
    return APIResponse.ok(data=ReportPhotoOut.model_validate(photo))


@router.get("/farm/{farm_id}", response_model=PaginatedResponse[ReportOut])
def farm_reports(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
    include_deleted: bool = Query(False),
):
    logger.info("GET /api/reports/farm/%s: user_id=%s include_deleted=%s", farm_id, current_user.id, include_deleted)
    farm_service.get_farm(db, farm_id, current_user)
    if include_deleted and current_user.role != UserRole.admin:
        logger.warning("GET /api/reports/farm/%s: non-admin requested include_deleted user_id=%s", farm_id, current_user.id)
        raise HTTPException(status_code=403, detail="Only admins can view deleted records")
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size, include_deleted=include_deleted)
    logger.info("GET /api/reports/farm/%s: returning total=%d", farm_id, total)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{report_id}", response_model=APIResponse[ReportOut])
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("GET /api/reports/%s: user_id=%s", report_id, current_user.id)
    report = report_service.get_report(db, report_id, current_user)
    logger.info("GET /api/reports/%s: success", report_id)
    return APIResponse.ok(data=ReportOut.model_validate(report))


@router.delete("/{report_id}", response_model=APIResponse)
def delete_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("DELETE /api/reports/%s: user_id=%s", report_id, current_user.id)
    report_service.delete_report(db, report_id, current_user)
    logger.info("DELETE /api/reports/%s: success", report_id)
    return APIResponse.ok(message="Report deleted")
