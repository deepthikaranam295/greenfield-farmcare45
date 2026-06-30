import logging
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import lead_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.leads")

router = APIRouter(tags=["Leads"])


def _lead_to_out(lead) -> LeadOut:
    return LeadOut(
        id=lead.id,
        name=lead.name,
        email=lead.email,
        whatsapp=lead.whatsapp,
        phone=lead.phone,
        services=lead.services,
        state=lead.state,
        district=lead.district,
        mandal=lead.mandal,
        village=lead.village,
        size_acres=lead.size_acres,
        budget_range=lead.budget_range,
        farm_coordinates=lead.farm_coordinates,
        other_details=lead.other_details,
        status=lead.status,
        assigned_to=lead.assigned_to,
        assigned_to_name=lead.assigned_user.name if lead.assigned_user else None,
        notes=lead.notes,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


# Public — no auth required (contact form submission)
@router.post("/api/public/leads", response_model=APIResponse[LeadOut])
def submit_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    logger.info("POST /api/public/leads: name=%s whatsapp=%s", payload.name, payload.whatsapp)
    lead = lead_service.create_lead(db, payload)
    return APIResponse.ok(data=_lead_to_out(lead), message="Request received. We will contact you within 24 hours.")


# Admin — all leads
@router.get("/api/leads", response_model=PaginatedResponse[LeadOut])
def list_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    p: Pagination = Depends(),
    status: Optional[str] = Query(None),
    assigned_to: Optional[uuid.UUID] = Query(None),
):
    logger.info("GET /api/leads: page=%d status=%s assigned_to=%s", p.page, status, assigned_to)
    rows, total = lead_service.list_leads(db, p.offset, p.size, status, assigned_to)
    return PaginatedResponse.ok(
        data=[_lead_to_out(r) for r in rows],
        total=total, page=p.page, size=p.size,
    )


# Field team — only their assigned leads
@router.get("/api/leads/mine", response_model=PaginatedResponse[LeadOut])
def my_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    p: Pagination = Depends(),
):
    logger.info("GET /api/leads/mine: user_id=%s", current_user.id)
    rows, total = lead_service.list_my_leads(db, current_user, p.offset, p.size)
    return PaginatedResponse.ok(
        data=[_lead_to_out(r) for r in rows],
        total=total, page=p.page, size=p.size,
    )


# Admin or assigned field team — update status / assign / notes
@router.patch("/api/leads/{lead_id}", response_model=APIResponse[LeadOut])
def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info("PATCH /api/leads/%s: user=%s", lead_id, current_user.id)
    if current_user.role not in (UserRole.admin, UserRole.field_team):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")
    lead = lead_service.update_lead(db, lead_id, payload, current_user)
    return APIResponse.ok(data=_lead_to_out(lead))
