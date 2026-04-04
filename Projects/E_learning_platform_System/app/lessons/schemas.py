from pydantic import BaseModel, ConfigDict
from typing import Optional


# ===============================
# Base
# ===============================
class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    course_id: int
    order_no: int


# ===============================
# Create
# ===============================
class LessonCreate(LessonBase):
    pass


# ===============================
# Update
# ===============================
class LessonUpdate(LessonBase):
    pass


# ===============================
# Patch
# ===============================
class LessonPatch(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    course_id: Optional[int] = None
    order_no: Optional[int] = None


# ===============================
# Response
# ===============================
class LessonOut(LessonBase):
    id: int

    model_config = ConfigDict(from_attributes=True)