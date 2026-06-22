import uuid
from datetime import datetime, timezone, date
from typing import Optional
from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey, Integer, BigInteger, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class TaskType(str, enum.Enum):
    soil_test = "soil_test"
    irrigation = "irrigation"
    fertilization = "fertilization"
    pest_control = "pest_control"
    harvesting = "harvesting"
    inspection = "inspection"
    other = "other"


class TaskStatus(str, enum.Enum):
    requested = "requested"
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_number: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    task_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False, index=True)
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    task_type: Mapped[TaskType] = mapped_column(SAEnum(TaskType), nullable=False)
    status: Mapped[TaskStatus] = mapped_column(SAEnum(TaskStatus), default=TaskStatus.pending)
    priority: Mapped[Optional[TaskPriority]] = mapped_column(SAEnum(TaskPriority), nullable=True, default=TaskPriority.medium)
    planned_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    scheduled_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    planned_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    delay_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completed_date: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    farm: Mapped["Farm"] = relationship("Farm", back_populates="tasks")
    customer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[customer_id])
    assignee: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    reports: Mapped[list["FieldReport"]] = relationship("FieldReport", back_populates="task")
    vendor_orders: Mapped[list["VendorOrder"]] = relationship("VendorOrder", back_populates="task")
