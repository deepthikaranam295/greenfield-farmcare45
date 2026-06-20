import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.farm import Farm
from app.models.user import User, UserRole
from app.schemas.farm import FarmCreate, FarmUpdate

logger = logging.getLogger("app.services.farm")


def create_farm(db: Session, payload: FarmCreate) -> Farm:
    logger.info("create_farm: customer_id=%s name=%s", payload.customer_id, payload.name)
    customer = db.query(User).filter(
        User.id == payload.customer_id,
        User.is_active == True,
        User.is_deleted == False,
    ).first()
    if not customer:
        logger.warning("create_farm: customer not found or inactive customer_id=%s", payload.customer_id)
        raise HTTPException(status_code=404, detail="Customer not found")
    farm = Farm(**payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    logger.info("create_farm: success farm_id=%s", farm.id)
    return farm


def list_farms(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 20,
    include_deleted: bool = False,
) -> tuple[list[Farm], int]:
    logger.info(
        "list_farms: user_id=%s role=%s skip=%d limit=%d include_deleted=%s",
        current_user.id, current_user.role, skip, limit, include_deleted,
    )
    q = db.query(Farm)
    if not include_deleted:
        q = q.filter(Farm.is_deleted == False)
    if current_user.role == UserRole.customer:
        q = q.filter(Farm.customer_id == current_user.id)
    total = q.count()
    farms = q.offset(skip).limit(limit).all()
    logger.info("list_farms: returning total=%d", total)
    return farms, total


def get_farm(db: Session, farm_id: uuid.UUID, current_user: User) -> Farm:
    logger.info("get_farm: farm_id=%s user_id=%s", farm_id, current_user.id)
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.is_deleted == False).first()
    if not farm:
        logger.warning("get_farm: not found farm_id=%s", farm_id)
        raise HTTPException(status_code=404, detail="Farm not found")
    if current_user.role == UserRole.customer and farm.customer_id != current_user.id:
        logger.warning("get_farm: access denied farm_id=%s user_id=%s", farm_id, current_user.id)
        raise HTTPException(status_code=403, detail="Access denied")
    logger.info("get_farm: found farm_id=%s", farm.id)
    return farm


def update_farm(db: Session, farm_id: uuid.UUID, payload: FarmUpdate, current_user: User) -> Farm:
    logger.info("update_farm: farm_id=%s user_id=%s", farm_id, current_user.id)
    farm = get_farm(db, farm_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
    db.commit()
    db.refresh(farm)
    logger.info("update_farm: success farm_id=%s", farm.id)
    return farm


def delete_farm(db: Session, farm_id: uuid.UUID, current_user: User) -> None:
    logger.info("delete_farm: farm_id=%s user_id=%s", farm_id, current_user.id)
    farm = get_farm(db, farm_id, current_user)
    farm.is_deleted = True
    farm.deleted_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("delete_farm: soft-deleted farm_id=%s", farm_id)
