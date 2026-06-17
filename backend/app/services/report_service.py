import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models.report import FieldReport, ReportPhoto
from app.models.user import User, UserRole
from app.schemas.report import ReportCreate
from app.services.s3_service import upload_file_to_s3


def create_report(db: Session, payload: ReportCreate, current_user: User) -> FieldReport:
    report = FieldReport(**payload.model_dump(), submitted_by=current_user.id)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_report(db: Session, report_id: uuid.UUID, current_user: User) -> FieldReport:
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role == UserRole.field_team and report.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return report


def get_farm_reports(db: Session, farm_id: uuid.UUID, skip: int = 0, limit: int = 20) -> tuple[list[FieldReport], int]:
    q = db.query(FieldReport).filter(FieldReport.farm_id == farm_id)
    total = q.count()
    return q.offset(skip).limit(limit).all(), total


async def add_photo(db: Session, report_id: uuid.UUID, file: UploadFile, caption: str, current_user: User) -> ReportPhoto:
    report = get_report(db, report_id, current_user)
    contents = await file.read()
    key = f"reports/{report_id}/{file.filename}"
    s3_url = upload_file_to_s3(contents, key, file.content_type)
    photo = ReportPhoto(report_id=report.id, s3_url=s3_url, caption=caption)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo
