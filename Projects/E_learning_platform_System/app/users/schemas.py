from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


# ===============================
# Base
# ===============================
class UserBase(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(pattern="^(student|instructor)$")


# ===============================
# Create
# ===============================
class UserCreate(UserBase):
    password: str = Field(min_length=6)


# ===============================
# Update
# ===============================
class UserUpdate(UserBase):
    password: str = Field(min_length=6)


# ===============================
# Patch
# ===============================
class UserPatch(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None


# ===============================
# Response
# ===============================
class UserOut(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)