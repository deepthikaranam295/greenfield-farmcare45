import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class FarmStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"


class SubscriptionPlan(str, enum.Enum):
    basic = "basic"
    standard = "standard"
    premium = "premium"
    none = "none"


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    village: Mapped[str] = mapped_column(String(100), nullable=True)
    mandal: Mapped[str] = mapped_column(String(100), nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=True)
    size_acres: Mapped[float] = mapped_column(Float, nullable=True)
    gps_lat: Mapped[float] = mapped_column(Float, nullable=True)
    gps_lng: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[FarmStatus] = mapped_column(SAEnum(FarmStatus), default=FarmStatus.active)
    subscription_plan: Mapped[SubscriptionPlan] = mapped_column(SAEnum(SubscriptionPlan), default=SubscriptionPlan.none)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer: Mapped["User"] = relationship("User", back_populates="farms", foreign_keys=[customer_id])
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="farm")
    reports: Mapped[list["FieldReport"]] = relationship("FieldReport", back_populates="farm")
