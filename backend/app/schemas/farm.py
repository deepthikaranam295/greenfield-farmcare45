import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.farm import FarmStatus, SubscriptionPlan


class FarmCreate(BaseModel):
    customer_id: uuid.UUID
    name: str
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    size_acres: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    subscription_plan: SubscriptionPlan = SubscriptionPlan.none


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    size_acres: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    status: Optional[FarmStatus] = None
    subscription_plan: Optional[SubscriptionPlan] = None


class FarmOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    name: str
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    size_acres: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    status: FarmStatus
    subscription_plan: SubscriptionPlan
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
