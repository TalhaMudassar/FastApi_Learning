from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# -------------------------
# Base
# -------------------------

class TaskBase(BaseModel):
    title: str = Field(..., max_length=100, example="Fix login bug")
    description: str | None = None
    status: str = Field(..., example="pending")
    priority: int = Field(..., ge=1, le=5)


# -------------------------
# Create
# -------------------------

class TaskCreate(TaskBase):
    project_id: int
    assigned_to: int | None = None
    due_date: datetime | None = None


# -------------------------
# Full Update
# -------------------------

class TaskUpdate(TaskBase):
    project_id: int
    assigned_to: int | None = None
    due_date: datetime | None = None


# -------------------------
# Patch
# -------------------------

class TaskPatch(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: int | None = Field(None, ge=1, le=5)
    project_id: int | None = None
    assigned_to: int | None = None
    due_date: datetime | None = None


# -------------------------
# Response
# -------------------------

class TaskOut(TaskBase):
    task_id: int
    project_id: int
    assigned_to: int | None
    created_at: datetime
    due_date: datetime | None

    model_config = ConfigDict(from_attributes=True)