from __future__ import annotations
from typing import TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text
from app.db.base import Base
from datetime import datetime

if TYPE_CHECKING:
    from app.projects.models import Projects
    from app.users.models import Users
    from app.comments.models import Comments


class Tasks(Base):
    __tablename__ = "tasks"

    task_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False)

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.project_id", ondelete="CASCADE"),nullable=False)

    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"),nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships

    # Many tasks → One project
    project: Mapped["Projects"] = relationship(back_populates="tasks")

    # Many tasks → One assigned user
    assigned_user: Mapped["Users"] = relationship(back_populates="tasks")

    # One task → Many comments
    comments: Mapped[List["Comments"]] = relationship(back_populates="task", cascade="all, delete")
    