from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint,String
from datetime import datetime
from app.db.base import Base

if TYPE_CHECKING:
    from app.courses.models import Course
    from app.enrollments.models import Enrollment
    from app.lessons.models import Lesson
    from app.users.models import User

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # 🔹 One-to-Many: Category → Courses
    courses: Mapped[list["Course"]] = relationship(back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name})>"