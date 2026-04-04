from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.users.models import User
from app.users.schemas import *


async def create_user(session: AsyncSession, data: UserCreate):
    user = User(**data.model_dump())

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user


async def get_user(session: AsyncSession, user_id: int):
    user = await session.get(User, user_id)

    if not user:
        raise HTTPException(404, "User not found")

    return user


async def get_users(session: AsyncSession):
    result = await session.scalars(select(User))
    return result.all()


async def update_user(session: AsyncSession, user_id: int, data: UserUpdate):
    user = await get_user(session, user_id)

    for key, value in data.model_dump().items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)

    return user


async def patch_user(session: AsyncSession, user_id: int, data: UserPatch):
    user = await get_user(session, user_id)

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)

    return user


async def delete_user(session: AsyncSession, user_id: int):
    user = await get_user(session, user_id)

    await session.delete(user)
    await session.commit()

    return {"message": "User deleted"}