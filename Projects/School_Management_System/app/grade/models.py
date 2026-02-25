from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.db.base import Base

if TYPE_CHECKING:
    from app.classroom.models import Classroom
    from app.course.models import Course


class Grade(Base):
    __tablename__ = "grade"

    grade_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(45))
    desc: Mapped[str] = mapped_column(String(45), nullable=True)

    classrooms: Mapped[list["Classroom"]] = relationship(
        "Classroom",
        back_populates="grade"
    )

    courses: Mapped[list["Course"]] = relationship(
        "Course",
        back_populates="grade"
    )