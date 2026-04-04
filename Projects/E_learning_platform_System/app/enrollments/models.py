from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint
from datetime import datetime
from app.db.base import Base

if TYPE_CHECKING:
    from app.categories.models import Category 
    from app.courses.models import Course
    from app.lessons.models import Lesson
    from app.users.models import User


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))

    enrolled_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id"),)

    # 🔹 Many-to-One
    user: Mapped["User"] = relationship(back_populates="enrollments")

    course: Mapped["Course"] = relationship(back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment(user_id={self.user_id}, course_id={self.course_id})>"