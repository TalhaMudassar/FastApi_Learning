from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

# ===============================
# Base Schema
# ===============================
class CategoryBase(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=50,
        description="Category name",
        examples=["Programming"]
    )

# ===============================
# Create
# ===============================
class CategoryCreate(CategoryBase):
    pass

# ===============================
# Update (PUT)
# ===============================
class CategoryUpdate(CategoryBase):
    pass

# ===============================
# Partial Update (PATCH)
# ===============================
class CategoryPatch(BaseModel):
    name: Optional[str] = Field(default=None, min_length=3, max_length=50)

# ===============================
# Response
# ===============================
class CategoryOut(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)