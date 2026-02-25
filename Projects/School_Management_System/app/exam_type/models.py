from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from app.db.base import Base

if TYPE_CHECKING:
    from app.exam.models import Exam


class ExamType(Base):
    __tablename__ = "exam_type"

    exam_type_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(45))
    desc: Mapped[str] = mapped_column(String(45), nullable=True)

    exams: Mapped[list["Exam"]] = relationship(
        "Exam",
        back_populates="exam_type"
    )