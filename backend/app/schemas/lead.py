import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.lead import LeadStatus


class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    phone: Optional[str] = None
    services: Optional[List[str]] = None
    state: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    size_acres: Optional[str] = None
    budget_range: Optional[str] = None
    farm_coordinates: Optional[str] = None
    other_details: Optional[str] = None
    # legacy fields kept for backward compat
    city: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    assigned_to: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class LeadOut(BaseModel):
    id: uuid.UUID
    name: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    phone: Optional[str] = None
    services: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    size_acres: Optional[str] = None
    budget_range: Optional[str] = None
    farm_coordinates: Optional[str] = None
    other_details: Optional[str] = None
    status: LeadStatus
    assigned_to: Optional[uuid.UUID] = None
    assigned_to_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
