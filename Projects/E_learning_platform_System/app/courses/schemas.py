from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class CourseBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = None
    instructor_id: int
    category_id: int


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    pass


class CoursePatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructor_id: Optional[int] = None
    category_id: Optional[int] = None


class CourseOut(CourseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)