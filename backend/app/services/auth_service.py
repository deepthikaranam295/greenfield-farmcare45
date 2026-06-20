import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.profile import FarmOwnerProfile, WorkerProfile, PasswordResetToken
from app.schemas.user import UserCreate, RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

logger = logging.getLogger("app.services.auth")


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def register_user(db: Session, payload: UserCreate) -> User:
    logger.info("register_user: attempt email=%s", payload.email)
    if db.query(User).filter(User.email == payload.email).first():
        logger.warning("register_user: duplicate email=%s", payload.email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("register_user: success user_id=%s", user.id)
    return user


def register_public(db: Session, payload: RegisterRequest) -> User:
    """Public self-registration — creates role-specific profile records."""
    logger.info("register_public: attempt email=%s role=%s", payload.email, payload.role)
    if db.query(User).filter(User.email == payload.email).first():
        logger.warning("register_public: duplicate email=%s", payload.email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    if payload.role == UserRole.farm_owner:
        db.add(FarmOwnerProfile(
            user_id=user.id,
            farm_name=payload.farm_name,
            farm_location=payload.farm_location,
        ))
    elif payload.role == UserRole.farm_worker:
        db.add(WorkerProfile(
            user_id=user.id,
            skills=payload.skills or "",
            experience=payload.experience or "",
        ))

    db.commit()
    db.refresh(user)
    logger.info("register_public: success user_id=%s role=%s", user.id, user.role)
    return user


def login_user(db: Session, payload: LoginRequest) -> dict:
    logger.info("login_user: attempt email=%s", payload.email)
    user = db.query(User).filter(
        User.email == payload.email,
        User.is_active == True,
        User.is_deleted == False,
    ).first()
    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning("login_user: invalid credentials email=%s", payload.email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    # Attach profile fields to user object for serialization
    _attach_profile(db, user)

    logger.info("login_user: success user_id=%s", user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}


def _attach_profile(db: Session, user: User) -> None:
    """Attach profile fields directly onto the user ORM object for schema serialization."""
    if user.role == UserRole.farm_owner:
        p = db.query(FarmOwnerProfile).filter(FarmOwnerProfile.user_id == user.id).first()
        if p:
            user.farm_name = p.farm_name
            user.farm_location = p.farm_location
    elif user.role == UserRole.farm_worker:
        p = db.query(WorkerProfile).filter(WorkerProfile.user_id == user.id).first()
        if p:
            user.skills = p.skills
            user.experience = p.experience


def forgot_password(db: Session, email: str) -> str | None:
    """Generates a reset token. Returns the raw token (caller sends it to user via email).
    Returns None if email not found (caller should still return 200 to prevent enumeration)."""
    logger.info("forgot_password: email=%s", email)
    user = db.query(User).filter(
        User.email == email,
        User.is_active == True,
        User.is_deleted == False,
    ).first()
    if not user:
        logger.warning("forgot_password: email not found email=%s", email)
        return None

    # Invalidate any previous tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at == None,
    ).update({"used_at": datetime.now(timezone.utc)})

    raw_token = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    db.commit()
    logger.info("forgot_password: token created user_id=%s", user.id)
    return raw_token


def reset_password(db: Session, token: str, new_password: str) -> None:
    logger.info("reset_password: attempt")
    token_hash = _hash_token(token)
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used_at == None,
    ).first()

    if not record:
        logger.warning("reset_password: invalid token")
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if record.expires_at < datetime.now(timezone.utc):
        logger.warning("reset_password: expired token")
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(new_password)
    record.used_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("reset_password: success user_id=%s", user.id)


def get_user_by_id(db: Session, user_id) -> User:
    logger.info("get_user_by_id: user_id=%s", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("get_user_by_id: not found user_id=%s", user_id)
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    logger.info("get_user_by_id: found user_id=%s", user_id)
    return user
