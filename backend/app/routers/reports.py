import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.report import ReportCreate, ReportOut, ReportPhotoOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import report_service
from app.dependencies.auth import get_current_user, require_admin_or_field
from app.models.user import User
from app.utils.pagination import Pagination

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("", response_model=APIResponse[ReportOut])
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
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
    photo = await report_service.add_photo(db, report_id, file, caption, current_user)
    return APIResponse.ok(data=ReportPhotoOut.model_validate(photo))


@router.get("/farm/{farm_id}", response_model=PaginatedResponse[ReportOut])
def farm_reports(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
):
    reports, total = report_service.get_farm_reports(db, farm_id, p.skip, p.size)
    return PaginatedResponse(
        data=[ReportOut.model_validate(r) for r in reports],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.get("/{report_id}", response_model=APIResponse[ReportOut])
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = report_service.get_report(db, report_id, current_user)
    return APIResponse.ok(data=ReportOut.model_validate(report))
