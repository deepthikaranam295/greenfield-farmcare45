import uuid
from datetime import datetime, timezone, date, time
from typing import Optional
from sqlalchemy import String, BigInteger, Date, Time, DateTime, ForeignKey, Text, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class ReportStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    reviewed = "reviewed"
    completed = "completed"
    follow_up_required = "follow_up_required"


class FieldReport(Base):
    __tablename__ = "field_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False, index=True)
    submitted_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    arrival_time: Mapped[time] = mapped_column(Time, nullable=True)
    departure_time: Mapped[time] = mapped_column(Time, nullable=True)
    work_done: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    report_number: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    status: Mapped[ReportStatus] = mapped_column(SAEnum(ReportStatus), default=ReportStatus.draft)
    issues_found: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_visit_needed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    task: Mapped["Task"] = relationship("Task", back_populates="reports")
    farm: Mapped["Farm"] = relationship("Farm", back_populates="reports")
    submitted_by_user: Mapped["User"] = relationship("User", back_populates="reports")
    photos: Mapped[list["ReportPhoto"]] = relationship("ReportPhoto", back_populates="report", cascade="all, delete-orphan")


class ReportPhoto(Base):
    __tablename__ = "report_photos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("field_reports.id"), nullable=False, index=True)
    s3_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str] = mapped_column(String(255), nullable=True)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    report: Mapped["FieldReport"] = relationship("FieldReport", back_populates="photos")
