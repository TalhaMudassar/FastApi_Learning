from __future__ import annotations
from typing import TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text
from app.db.base import Base
from datetime import datetime

if TYPE_CHECKING:
    from app.users.models import Users
    from app.tasks.models import Tasks


class Projects(Base):
    __tablename__ = "projects"

    project_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    # N Projects → 1 User  (MANY PROJECTS --> ONE USER) 
    owner: Mapped["Users"] = relationship(back_populates="projects")

    # 1 Project → N Tasks  (ONE PROJECT --> MANY TASKS)
    tasks: Mapped[List["Tasks"]] = relationship(
        back_populates="project", cascade="all, delete"
    )
    
