from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.grade.models import Grade


async def create_grade(**kwargs):
    async with async_session() as session:
        grade = Grade(**kwargs)
        session.add(grade)
        await session.commit()
        await session.refresh(grade)
        return grade


async def get_grades():
    async with async_session() as session:
        stmt = select(Grade)
        result = await session.scalars(stmt)
        return result.all()


async def get_grade(grade_id: int):
    async with async_session() as session:
        stmt = select(Grade).where(Grade.grade_id == grade_id)
        return await session.scalar(stmt)


async def update_grade(grade_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Grade)
            .where(Grade.grade_id == grade_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_grade(grade_id)


async def delete_grade(grade_id: int):
    async with async_session() as session:
        stmt = delete(Grade).where(Grade.grade_id == grade_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}