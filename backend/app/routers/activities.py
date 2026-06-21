import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_field
from app.models.user import User
from app.models.activity import FarmActivity
from app.schemas.activity import ActivityCreate, ActivityOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.activities")

router = APIRouter(prefix="/api/farms", tags=["Activities"])


@router.get("/{farm_id}/activities", response_model=PaginatedResponse[ActivityOut])
def list_activities(
    farm_id: uuid.UUID,
    p: Pagination = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info("GET /api/farms/%s/activities: user_id=%s", farm_id, current_user.id)
    q = db.query(FarmActivity).filter(FarmActivity.farm_id == farm_id).order_by(FarmActivity.date.desc())
    total = q.count()
    items = q.offset(p.skip).limit(p.size).all()
    return PaginatedResponse(
        data=[ActivityOut.model_validate(a) for a in items],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.post("/{farm_id}/activities", response_model=APIResponse[ActivityOut])
def create_activity(
    farm_id: uuid.UUID,
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_field),
):
    logger.info("POST /api/farms/%s/activities: user_id=%s type=%s", farm_id, current_user.id, payload.type)
    act = FarmActivity(farm_id=farm_id, created_by=current_user.id, **payload.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    logger.info("POST /api/farms/%s/activities: created id=%s", farm_id, act.id)
    return APIResponse.ok(data=ActivityOut.model_validate(act))


@router.delete("/{farm_id}/activities/{activity_id}", response_model=APIResponse)
def delete_activity(
    farm_id: uuid.UUID,
    activity_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("DELETE /api/farms/%s/activities/%s: user_id=%s", farm_id, activity_id, current_user.id)
    act = db.query(FarmActivity).filter(
        FarmActivity.id == activity_id,
        FarmActivity.farm_id == farm_id,
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
    logger.info("DELETE /api/farms/%s/activities/%s: deleted", farm_id, activity_id)
    return APIResponse.ok(message="Activity deleted")
