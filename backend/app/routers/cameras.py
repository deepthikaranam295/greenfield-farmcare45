import logging
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.camera import CameraCreate, CameraUpdate, CameraOut
from app.schemas.common import APIResponse
from app.services import camera_service, farm_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User

logger = logging.getLogger("app.routers.cameras")

router = APIRouter(prefix="/api/farms/{farm_id}/cameras", tags=["Cameras"])


@router.get("", response_model=APIResponse[list[CameraOut]])
def list_cameras(
    farm_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info("GET cameras: farm_id=%s user_id=%s", farm_id, current_user.id)
    farm_service.get_farm(db, farm_id, current_user)
    cameras = camera_service.list_cameras(db, farm_id)
    return APIResponse.ok(data=[CameraOut.model_validate(c) for c in cameras])


@router.post("", response_model=APIResponse[CameraOut])
def create_camera(
    farm_id: uuid.UUID,
    payload: CameraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("POST camera: farm_id=%s user_id=%s name=%s", farm_id, current_user.id, payload.name)
    farm_service.get_farm(db, farm_id, current_user)
    camera = camera_service.create_camera(db, farm_id, payload)
    return APIResponse.ok(data=CameraOut.model_validate(camera))


@router.put("/{camera_id}", response_model=APIResponse[CameraOut])
def update_camera(
    farm_id: uuid.UUID,
    camera_id: uuid.UUID,
    payload: CameraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("PUT camera: camera_id=%s user_id=%s", camera_id, current_user.id)
    camera = camera_service.update_camera(db, camera_id, farm_id, payload)
    return APIResponse.ok(data=CameraOut.model_validate(camera))


@router.delete("/{camera_id}", response_model=APIResponse)
def delete_camera(
    farm_id: uuid.UUID,
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logger.info("DELETE camera: camera_id=%s user_id=%s", camera_id, current_user.id)
    camera_service.delete_camera(db, camera_id, farm_id)
    return APIResponse.ok(message="Camera deleted")
