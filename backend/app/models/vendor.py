import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import String, Boolean, DateTime, Date, ForeignKey, Text, Numeric, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class VendorOrderStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    service_type: Mapped[str] = mapped_column(String(100), nullable=True)
    contact_name: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    orders: Mapped[list["VendorOrder"]] = relationship("VendorOrder", back_populates="vendor")


class VendorOrder(Base):
    __tablename__ = "vendor_orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)
    order_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_completion: Mapped[date] = mapped_column(Date, nullable=True)
    actual_completion: Mapped[date] = mapped_column(Date, nullable=True)
    vendor_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=True)
    our_charge: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[VendorOrderStatus] = mapped_column(SAEnum(VendorOrderStatus), default=VendorOrderStatus.pending)
    sign_off_by: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    task: Mapped["Task"] = relationship("Task", back_populates="vendor_orders")
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="orders")
