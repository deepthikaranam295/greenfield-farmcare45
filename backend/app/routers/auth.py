from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, LoginRequest, LoginResponse, UserOut, PasswordResetRequest
from app.schemas.common import APIResponse
from app.services import auth_service
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=APIResponse[UserOut])
def register(payload: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, payload)
    return APIResponse.ok(data=UserOut.model_validate(user), message="User registered")


@router.post("/login", response_model=APIResponse[LoginResponse])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login_user(db, payload)
    return APIResponse.ok(data=LoginResponse(
        access_token=result["access_token"],
        token_type=result["token_type"],
        user=UserOut.model_validate(result["user"]),
    ))


@router.post("/logout", response_model=APIResponse)
def logout(current_user: User = Depends(get_current_user)):
    return APIResponse.ok(message="Logged out successfully")


@router.post("/reset-password", response_model=APIResponse)
def reset_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        pass
    return APIResponse.ok(message="If this email exists, a reset link has been sent")
