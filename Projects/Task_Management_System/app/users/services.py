from app.db.config import async_session
from app.users.models import Users
from sqlalchemy import select
from fastapi import HTTPException
from app.users.schemas import UserCreate, UserUpdate, UserPatch

from sqlalchemy.ext.asyncio import AsyncSession


async def create_user(session:AsyncSession,new_user: UserCreate):
        user = Users(
            username=new_user.username,
            email=new_user.email,
            password=new_user.password,  # Later hash this!
        )

        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def get_user(session:AsyncSession,user_id: int):
        user = await session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user


async def get_all_users(session:AsyncSession):
    
        result = await session.scalars(select(Users))
        return result.all()


async def update_user(session:AsyncSession,user_id: int, new_user: UserUpdate):

        user = await session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for key, value in new_user.model_dump().items():
            setattr(user, key, value)

        await session.commit()
        await session.refresh(user)
        return user


async def patch_user(session:AsyncSession,user_id: int, new_user: UserPatch):

        user = await session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for key, value in new_user.model_dump(exclude_unset=True).items():
            setattr(user, key, value)

        await session.commit()
        await session.refresh(user)
        return user


async def delete_user(session:AsyncSession,user_id: int):
   
        user = await session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await session.delete(user)
        await session.commit()

        return {"message": "User deleted successfully"}