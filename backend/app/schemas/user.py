import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.customer


class RegisterRequest(BaseModel):
    """Public self-registration — supports all non-admin roles with profile data."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    confirm_password: str
    role: UserRole = UserRole.customer
    # Farm Owner fields
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    # Farm Worker fields
    skills: Optional[str] = None
    experience: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @model_validator(mode="after")
    def validate_fields(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if self.role not in (UserRole.farm_owner, UserRole.farm_worker, UserRole.customer):
            raise ValueError("Public registration only allows farm_owner, farm_worker, or customer roles")
        if self.role == UserRole.farm_owner:
            if not self.farm_name:
                raise ValueError("Farm name is required for Farm Owner registration")
            if not self.farm_location:
                raise ValueError("Farm location is required for Farm Owner registration")
        return self


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    password_set: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None

    model_config = {"from_attributes": True}


class UserCreateResult(BaseModel):
    user: UserOut
    activation_link: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class ActivateAccountRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
