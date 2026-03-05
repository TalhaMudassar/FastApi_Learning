from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


# -------------------------
# Shared Base
# -------------------------

class UserBase(BaseModel):
    username: str = Field(..., max_length=50, example="john_doe")
    email: EmailStr


# -------------------------
# Create
# -------------------------

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


# -------------------------
# Full Update (PUT)
# -------------------------

class UserUpdate(UserBase):
    password: str = Field(..., min_length=6)
    is_active: bool


# -------------------------
# Partial Update (PATCH)
# -------------------------

class UserPatch(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    is_active: bool | None = None


# -------------------------
# Response
# -------------------------

class UserOut(UserBase):
    user_id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)