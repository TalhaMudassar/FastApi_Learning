from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey
from typing import TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.categories.models import Category 
    from app.courses.models import Course
    from app.enrollments.models import Enrollment
    from app.users.models import User


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text)

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))

    order_no: Mapped[int] = mapped_column(nullable=False)

    # 🔹 Many-to-One: Lesson → Course
    course: Mapped["Course"] = relationship(back_populates="lessons")

    def __repr__(self):
        return f"<Lesson(id={self.id}, title={self.title})>"