import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

logger = logging.getLogger("app.auth")

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    logger.info("get_current_user: validating token")
    payload = decode_token(credentials.credentials)
    if not payload:
        logger.warning("get_current_user: invalid or expired token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(
        User.id == payload.get("sub"),
        User.is_active == True,
        User.is_deleted == False,
    ).first()
    if not user:
        logger.warning("get_current_user: user not found or inactive, sub=%s", payload.get("sub"))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_roles(*roles: UserRole):
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            logger.warning(
                "require_roles: access denied user_id=%s role=%s required=%s",
                current_user.id, current_user.role, roles,
            )
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return _check


require_admin = require_roles(UserRole.admin)
require_admin_or_field = require_roles(UserRole.admin, UserRole.field_team, UserRole.farm_worker)
require_farm_owner = require_roles(UserRole.admin, UserRole.farm_owner)
require_farm_worker = require_roles(UserRole.admin, UserRole.farm_worker, UserRole.field_team)
require_any = get_current_user
