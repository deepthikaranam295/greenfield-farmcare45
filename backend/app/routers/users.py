import logging
from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserOut, UserCreateResult
from app.schemas.common import APIResponse, PaginatedResponse
from app.services import auth_service
from app.dependencies.auth import require_admin
from app.models.user import User, UserRole
from app.utils.pagination import Pagination

logger = logging.getLogger("app.routers.users")

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=PaginatedResponse[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    p: Pagination = Depends(),
    role: Optional[str] = Query(None, description="Filter by role: admin, field_team, customer"),
):
    logger.info("GET /api/users: page=%d size=%d role=%s", p.page, p.size, role)
    q = db.query(User).filter(User.is_deleted == False)
    if role:
        try:
            q = q.filter(User.role == UserRole(role))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}. Valid values: admin, field_team, customer")
    q = q.order_by(User.name.asc())
    total = q.count()
    users = q.offset(p.skip).limit(p.size).all()
    logger.info("GET /api/users: returning total=%d", total)
    return PaginatedResponse(
        data=[UserOut.model_validate(u) for u in users],
        total=total, page=p.page, size=p.size, pages=p.pages(total),
    )


@router.post("", response_model=APIResponse[UserCreateResult])
def create_user(
    payload: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if payload.role == UserRole.customer:
        raise HTTPException(status_code=400, detail="Customers register themselves via /signup. Admin can only create admin or field_team users.")
    logger.info("POST /api/users: email=%s role=%s", payload.email, payload.role)
    user, raw_token = auth_service.create_user_with_activation(db, payload)
    base_url = str(request.base_url).rstrip("/")
    activation_link = f"{base_url}/activate?token={raw_token}"
    logger.info("POST /api/users: success user_id=%s", user.id)
    return APIResponse.ok(
        data=UserCreateResult(user=UserOut.model_validate(user), activation_link=activation_link),
        message="User created. Share the activation link with them.",
    )


@router.patch("/{user_id}/deactivate", response_model=APIResponse[UserOut])
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    logger.info("PATCH /api/users/%s/deactivate: admin_id=%s", user_id, current_admin.id)
    user = auth_service.get_user_by_id(db, user_id)
    if str(user.id) == str(current_admin.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user.is_active = False
    db.commit()
    db.refresh(user)
    logger.info("PATCH /api/users/%s/deactivate: success", user_id)
    return APIResponse.ok(data=UserOut.model_validate(user), message="User deactivated")


@router.patch("/{user_id}/activate", response_model=APIResponse[UserOut])
def activate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    logger.info("PATCH /api/users/%s/activate: user_id=%s", user_id, _)
    user = auth_service.get_user_by_id(db, user_id)
    user.is_active = True
    db.commit()
    db.refresh(user)
    logger.info("PATCH /api/users/%s/activate: success", user_id)
    return APIResponse.ok(data=UserOut.model_validate(user), message="User activated")
