from fastapi import APIRouter, Depends
from typing import List
from app.categories.schemas import *
from app.db.config import SessionDep
from app.categories import services

router = APIRouter(prefix="/categories", tags=["Categories"])


# ===============================
# Create
# ===============================
@router.post("/", response_model=CategoryOut)
async def create_category(session: SessionDep, data: CategoryCreate):
    return await services.create_category(session, data)


# ===============================
# Get All
# ===============================
@router.get("/", response_model=List[CategoryOut])
async def get_categories(session: SessionDep):
    return await services.get_categories(session)


# ===============================
# Get One
# ===============================
@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(session: SessionDep, category_id: int):
    return await services.get_category(session, category_id)


# ===============================
# Update
# ===============================
@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(session: SessionDep, category_id: int, data: CategoryUpdate):
    return await services.update_category(session, category_id, data)


# ===============================
# Patch
# ===============================
@router.patch("/{category_id}", response_model=CategoryOut)
async def patch_category(session: SessionDep, category_id: int, data: CategoryPatch):
    return await services.patch_category(session, category_id, data)


# ===============================
# Delete
# ===============================
@router.delete("/{category_id}")
async def delete_category(session: SessionDep, category_id: int):
    return await services.delete_category(session, category_id)