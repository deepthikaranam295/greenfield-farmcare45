import logging
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.camera import FarmCamera
from app.models.user import User, UserRole
from app.schemas.camera import CameraCreate, CameraUpdate

logger = logging.getLogger("app.services.camera")


def list_cameras(db: Session, farm_id: uuid.UUID) -> list[FarmCamera]:
    logger.info("list_cameras: farm_id=%s", farm_id)
    cameras = db.query(FarmCamera).filter(FarmCamera.farm_id == farm_id).order_by(FarmCamera.created_at).all()
    logger.info("list_cameras: returning %d cameras", len(cameras))
    return cameras


def create_camera(db: Session, farm_id: uuid.UUID, payload: CameraCreate) -> FarmCamera:
    logger.info("create_camera: farm_id=%s name=%s", farm_id, payload.name)
    camera = FarmCamera(farm_id=farm_id, **payload.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    logger.info("create_camera: success camera_id=%s", camera.id)
    return camera


def get_camera(db: Session, camera_id: uuid.UUID, farm_id: uuid.UUID) -> FarmCamera:
    camera = db.query(FarmCamera).filter(
        FarmCamera.id == camera_id,
        FarmCamera.farm_id == farm_id,
    ).first()
    if not camera:
        logger.warning("get_camera: not found camera_id=%s farm_id=%s", camera_id, farm_id)
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


def update_camera(db: Session, camera_id: uuid.UUID, farm_id: uuid.UUID, payload: CameraUpdate) -> FarmCamera:
    logger.info("update_camera: camera_id=%s", camera_id)
    camera = get_camera(db, camera_id, farm_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(camera, field, value)
    db.commit()
    db.refresh(camera)
    logger.info("update_camera: success camera_id=%s", camera_id)
    return camera


def delete_camera(db: Session, camera_id: uuid.UUID, farm_id: uuid.UUID) -> None:
    logger.info("delete_camera: camera_id=%s farm_id=%s", camera_id, farm_id)
    camera = get_camera(db, camera_id, farm_id)
    db.delete(camera)
    db.commit()
    logger.info("delete_camera: deleted camera_id=%s", camera_id)
