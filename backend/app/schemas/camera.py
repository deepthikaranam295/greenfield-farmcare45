import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl


class CameraCreate(BaseModel):
    name: str
    stream_url: str
    description: Optional[str] = None
    is_active: bool = True


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    stream_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CameraOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    name: str
    stream_url: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
