import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.lead import LeadStatus


class LeadCreate(BaseModel):
    name: str
    whatsapp: str
    city: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None
    services: Optional[List[str]] = None


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class LeadOut(BaseModel):
    id: uuid.UUID
    name: str
    whatsapp: str
    city: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None
    services: Optional[str] = None
    status: LeadStatus
    assigned_to: Optional[uuid.UUID] = None
    assigned_to_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
