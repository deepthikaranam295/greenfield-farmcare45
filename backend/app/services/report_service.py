import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models.report import FieldReport, ReportPhoto
from app.models.user import User, UserRole
from app.schemas.report import ReportCreate
from app.services.s3_service import upload_file_to_s3

logger = logging.getLogger("app.services.report")


def create_report(db: Session, payload: ReportCreate, current_user: User) -> FieldReport:
    logger.info("create_report: farm_id=%s user_id=%s", payload.farm_id, current_user.id)
    report = FieldReport(**payload.model_dump(), submitted_by=current_user.id)
    db.add(report)
    db.commit()
    db.refresh(report)
    logger.info("create_report: success report_id=%s", report.id)
    return report


def get_report(db: Session, report_id: uuid.UUID, current_user: User) -> FieldReport:
    logger.info("get_report: report_id=%s user_id=%s", report_id, current_user.id)
    report = db.query(FieldReport).filter(
        FieldReport.id == report_id,
        FieldReport.is_deleted == False,
    ).first()
    if not report:
        logger.warning("get_report: not found report_id=%s", report_id)
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role == UserRole.field_team and report.submitted_by != current_user.id:
        logger.warning("get_report: access denied report_id=%s user_id=%s", report_id, current_user.id)
        raise HTTPException(status_code=403, detail="Access denied")
    logger.info("get_report: found report_id=%s", report.id)
    return report


def get_farm_reports(
    db: Session,
    farm_id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
) -> tuple[list[FieldReport], int]:
    logger.info(
        "get_farm_reports: farm_id=%s skip=%d limit=%d include_deleted=%s",
        farm_id, skip, limit, include_deleted,
    )
    q = db.query(FieldReport).filter(FieldReport.farm_id == farm_id)
    if not include_deleted:
        q = q.filter(FieldReport.is_deleted == False)
    total = q.count()
    logger.info("get_farm_reports: returning total=%d", total)
    return q.offset(skip).limit(limit).all(), total


async def add_photo(
    db: Session,
    report_id: uuid.UUID,
    file: UploadFile,
    caption: str,
    current_user: User,
) -> ReportPhoto:
    logger.info("add_photo: report_id=%s user_id=%s filename=%s", report_id, current_user.id, file.filename)
    report = get_report(db, report_id, current_user)
    contents = await file.read()
    key = f"reports/{report_id}/{file.filename}"
    s3_url = upload_file_to_s3(contents, key, file.content_type)
    photo = ReportPhoto(report_id=report.id, s3_url=s3_url, caption=caption)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    logger.info("add_photo: success photo_id=%s", photo.id)
    return photo


def delete_report(db: Session, report_id: uuid.UUID, current_user: User) -> None:
    logger.info("delete_report: report_id=%s user_id=%s", report_id, current_user.id)
    report = get_report(db, report_id, current_user)
    report.is_deleted = True
    report.deleted_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("delete_report: soft-deleted report_id=%s", report_id)
