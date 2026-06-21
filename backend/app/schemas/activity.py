import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.models.activity import ActivityType


class ActivityCreate(BaseModel):
    date: date
    type: ActivityType
    description: str
    amount: Optional[float] = None


class ActivityOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    created_by: uuid.UUID
    date: date
    type: ActivityType
    description: str
    amount: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}
