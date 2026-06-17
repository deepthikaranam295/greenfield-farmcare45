import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, Date, DateTime, ForeignKey, Text, Enum as SAEnum
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
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False, index=True)
    assigned_to: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    task_type: Mapped[TaskType] = mapped_column(SAEnum(TaskType), nullable=False)
    status: Mapped[TaskStatus] = mapped_column(SAEnum(TaskStatus), default=TaskStatus.pending)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=True)
    completed_date: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    farm: Mapped["Farm"] = relationship("Farm", back_populates="tasks")
    assignee: Mapped["User"] = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    reports: Mapped[list["FieldReport"]] = relationship("FieldReport", back_populates="task")
    vendor_orders: Mapped[list["VendorOrder"]] = relationship("VendorOrder", back_populates="task")
