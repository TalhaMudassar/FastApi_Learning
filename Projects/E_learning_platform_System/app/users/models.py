from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint,String
from datetime import datetime
from app.db.base import Base

if TYPE_CHECKING:
    from app.categories.models import Category 
    from app.courses.models import Course
    from app.enrollments.models import Enrollment
    from app.lessons.models import Lesson


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    
    # 🔹 One-to-Many: Instructor → Courses
    courses: Mapped[list["Course"]] = relationship(back_populates="instructor",cascade="all, delete")

    # 🔹 Many-to-Many via Enrollment
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="user",cascade="all, delete")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"