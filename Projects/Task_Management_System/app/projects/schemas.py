from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# -------------------------
# Base
# -------------------------

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=100, example="Task App")
    description: str | None = Field(None, example="Project description")


# -------------------------
# Create
# -------------------------

class ProjectCreate(ProjectBase):
    owner_id: int


# -------------------------
# Full Update
# -------------------------

class ProjectUpdate(ProjectBase):
    owner_id: int


# -------------------------
# Patch
# -------------------------

class ProjectPatch(BaseModel):
    name: str | None = None
    description: str | None = None
    owner_id: int | None = None


# -------------------------
# Response
# -------------------------

class ProjectOut(ProjectBase):
    project_id: int
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)