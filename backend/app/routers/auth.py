import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import (
    UserCreate, RegisterRequest, LoginRequest, LoginResponse,
    UserOut, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.schemas.common import APIResponse
from app.services import auth_service
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger("app.routers.auth")

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=APIResponse[UserOut])
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    logger.info("POST /api/auth/register: email=%s role=%s", payload.email, payload.role)
    user = auth_service.register_public(db, payload)
    logger.info("POST /api/auth/register: success user_id=%s", user.id)
    return APIResponse.ok(data=UserOut.model_validate(user), message="Account created successfully")


@router.post("/login", response_model=APIResponse[LoginResponse])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    logger.info("POST /api/auth/login: email=%s", payload.email)
    result = auth_service.login_user(db, payload)
    logger.info("POST /api/auth/login: success user_id=%s", result["user"].id)
    user_out = _user_to_out(result["user"])
    return APIResponse.ok(data=LoginResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        user=user_out,
    ))


@router.post("/logout", response_model=APIResponse)
def logout(current_user: User = Depends(get_current_user)):
    logger.info("POST /api/auth/logout: user_id=%s", current_user.id)
    return APIResponse.ok(message="Logged out successfully")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    logger.info("POST /api/auth/forgot-password: email=%s", payload.email)
    raw_token = auth_service.forgot_password(db, payload.email)
    body = {"status": "success", "message": "If this email exists, a password reset link has been sent."}
    if settings.APP_ENV == "development" and raw_token:
        body["dev_reset_token"] = raw_token
    return body


@router.post("/reset-password", response_model=APIResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    logger.info("POST /api/auth/reset-password")
    auth_service.reset_password(db, payload.token, payload.new_password)
    return APIResponse.ok(message="Password reset successfully. You can now log in.")


@router.get("/me", response_model=APIResponse[UserOut])
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info("GET /api/auth/me: user_id=%s", current_user.id)
    auth_service._attach_profile(db, current_user)
    return APIResponse.ok(data=_user_to_out(current_user))


def _user_to_out(user: User) -> UserOut:
    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "farm_name": getattr(user, "farm_name", None),
        "farm_location": getattr(user, "farm_location", None),
        "skills": getattr(user, "skills", None),
        "experience": getattr(user, "experience", None),
    }
    return UserOut(**data)
