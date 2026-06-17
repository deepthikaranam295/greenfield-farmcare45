import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.farm import Farm
from app.models.user import User, UserRole
from app.schemas.farm import FarmCreate, FarmUpdate


def create_farm(db: Session, payload: FarmCreate) -> Farm:
    customer = db.query(User).filter(User.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    farm = Farm(**payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


def list_farms(db: Session, current_user: User, skip: int = 0, limit: int = 20) -> tuple[list[Farm], int]:
    q = db.query(Farm)
    if current_user.role == UserRole.customer:
        q = q.filter(Farm.customer_id == current_user.id)
    total = q.count()
    farms = q.offset(skip).limit(limit).all()
    return farms, total


def get_farm(db: Session, farm_id: uuid.UUID, current_user: User) -> Farm:
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if current_user.role == UserRole.customer and farm.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return farm


def update_farm(db: Session, farm_id: uuid.UUID, payload: FarmUpdate, current_user: User) -> Farm:
    farm = get_farm(db, farm_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
    db.commit()
    db.refresh(farm)
    return farm
