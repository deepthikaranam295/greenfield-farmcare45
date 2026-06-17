import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class NotificationChannel(str, enum.Enum):
    whatsapp = "whatsapp"
    email = "email"
    sms = "sms"
    push = "push"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    channel: Mapped[NotificationChannel] = mapped_column(SAEnum(NotificationChannel), nullable=False)
    message_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message_body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(SAEnum(NotificationStatus), default=NotificationStatus.pending)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    recipient: Mapped["User"] = relationship("User", back_populates="notifications")
