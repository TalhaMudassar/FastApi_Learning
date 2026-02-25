from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.classroom.models import Classroom


async def create_classroom(**kwargs):
    async with async_session() as session:
        classroom = Classroom(**kwargs)
        session.add(classroom)
        await session.commit()
        await session.refresh(classroom)
        return classroom


async def get_classrooms():
    async with async_session() as session:
        stmt = select(Classroom)
        result = await session.scalars(stmt)
        return result.all()


async def get_classroom(classroom_id: int): 
    async with async_session() as session:
        stmt = select(Classroom).where(Classroom.classroom_id == classroom_id)
        return await session.scalar(stmt)


async def update_classroom(classroom_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Classroom)
            .where(Classroom.classroom_id == classroom_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_classroom(classroom_id)


async def delete_classroom(classroom_id: int):
    async with async_session() as session:
        stmt = delete(Classroom).where(Classroom.classroom_id == classroom_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}