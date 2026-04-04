from fastapi import APIRouter
from typing import List
from app.db.config import SessionDep
from app.users.schemas import *
from app.users import services

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserOut)
async def create_user(session: SessionDep, data: UserCreate):
    return await services.create_user(session, data)


@router.get("/", response_model=List[UserOut])
async def get_users(session: SessionDep):
    return await services.get_users(session)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(session: SessionDep, user_id: int):
    return await services.get_user(session, user_id)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(session: SessionDep, user_id: int, data: UserUpdate):
    return await services.update_user(session, user_id, data)


@router.patch("/{user_id}", response_model=UserOut)
async def patch_user(session: SessionDep, user_id: int, data: UserPatch):
    return await services.patch_user(session, user_id, data)


@router.delete("/{user_id}")
async def delete_user(session: SessionDep, user_id: int):
    return await services.delete_user(session, user_id)