from pydantic import BaseModel, ConfigDict
from typing import Optional


# ===============================
# Base
# ===============================
class EnrollmentBase(BaseModel):
    user_id: int
    course_id: int


# ===============================
# Create
# ===============================
class EnrollmentCreate(EnrollmentBase):
    pass


# ===============================
# Update (rare but included)
# ===============================
class EnrollmentUpdate(EnrollmentBase):
    pass


# ===============================
# Patch
# ===============================
class EnrollmentPatch(BaseModel):
    user_id: Optional[int] = None
    course_id: Optional[int] = None


# ===============================
# Response
# ===============================
class EnrollmentOut(EnrollmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)