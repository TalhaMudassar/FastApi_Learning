from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey, DateTime
from datetime import datetime
from app.db.base import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.categories.models import Category 
    from app.enrollments.models import Enrollment
    from app.lessons.models import Lesson
    from app.users.models import User

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    instructor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


    # 🔹 Many-to-One: Course → User
    instructor: Mapped["User"] = relationship(back_populates="courses")

    # 🔹 Many-to-One: Course → Category
    category: Mapped["Category"] = relationship(back_populates="courses")

    # 🔹 One-to-Many: Course → Lessons
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="course",cascade="all, delete")

    # 🔹 Many-to-Many via Enrollment
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course",cascade="all, delete")

    def __repr__(self):
        return f"<Course(id={self.id}, title={self.title})>"