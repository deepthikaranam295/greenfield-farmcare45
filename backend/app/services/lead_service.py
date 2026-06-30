import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.lead import Lead, LeadStatus
from app.models.user import User, UserRole
from app.schemas.lead import LeadCreate, LeadUpdate

logger = logging.getLogger("app.services.lead")


def _with_relations(q):
    return q.options(joinedload(Lead.assigned_user))


def create_lead(db: Session, payload: LeadCreate) -> Lead:
    services_str = ", ".join(payload.services) if payload.services else None
    lead = Lead(
        name=payload.name,
        whatsapp=payload.whatsapp,
        city=payload.city,
        farm_location=payload.farm_location,
        farm_size=payload.farm_size,
        services=services_str,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    logger.info("create_lead: id=%s name=%s", lead.id, lead.name)
    return lead


def get_lead(db: Session, lead_id: uuid.UUID, current_user: User) -> Lead:
    lead = _with_relations(
        db.query(Lead).filter(Lead.id == lead_id, Lead.is_deleted == False)
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if current_user.role == UserRole.field_team and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return lead


def list_leads(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    assigned_to: Optional[uuid.UUID] = None,
) -> tuple[list[Lead], int]:
    q = db.query(Lead).filter(Lead.is_deleted == False)
    if status:
        try:
            q = q.filter(Lead.status == LeadStatus(status))
        except ValueError:
            pass
    if assigned_to:
        q = q.filter(Lead.assigned_to == assigned_to)
    total = q.count()
    rows = _with_relations(q.order_by(Lead.created_at.desc())).offset(skip).limit(limit).all()
    return rows, total


def list_my_leads(db: Session, current_user: User, skip: int = 0, limit: int = 20) -> tuple[list[Lead], int]:
    q = db.query(Lead).filter(Lead.is_deleted == False, Lead.assigned_to == current_user.id)
    total = q.count()
    rows = _with_relations(q.order_by(Lead.created_at.desc())).offset(skip).limit(limit).all()
    return rows, total


def update_lead(db: Session, lead_id: uuid.UUID, payload: LeadUpdate, current_user: User) -> Lead:
    lead = get_lead(db, lead_id, current_user)

    if current_user.role == UserRole.field_team:
        # Field team can only update status and notes
        if payload.status is not None:
            lead.status = payload.status
        if payload.notes is not None:
            lead.notes = payload.notes
    else:
        # Admin can update everything
        if payload.status is not None:
            lead.status = payload.status
        if payload.assigned_to is not None:
            assignee = db.query(User).filter(User.id == payload.assigned_to, User.is_deleted == False).first()
            if not assignee:
                raise HTTPException(status_code=404, detail="Assigned user not found")
            lead.assigned_to = payload.assigned_to
        if payload.notes is not None:
            lead.notes = payload.notes

    lead.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lead)
    logger.info("update_lead: id=%s status=%s assigned_to=%s", lead.id, lead.status, lead.assigned_to)
    return _with_relations(db.query(Lead).filter(Lead.id == lead_id)).first()
