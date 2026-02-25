from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.teacher.models import Teacher


async def create_teacher(**kwargs):
    async with async_session() as session:
        teacher = Teacher(**kwargs)
        session.add(teacher)
        await session.commit()
        await session.refresh(teacher)
        return teacher


async def get_teachers():
    async with async_session() as session:
        stmt = select(Teacher)
        result = await session.scalars(stmt)
        return result.all()


async def get_teacher(teacher_id: int):
    async with async_session() as session:
        stmt = select(Teacher).where(Teacher.teacher_id == teacher_id)
        return await session.scalar(stmt)


async def update_teacher(teacher_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Teacher)
            .where(Teacher.teacher_id == teacher_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_teacher(teacher_id)


async def delete_teacher(teacher_id: int):
    async with async_session() as session:
        stmt = delete(Teacher).where(Teacher.teacher_id == teacher_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}