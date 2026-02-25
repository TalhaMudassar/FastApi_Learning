from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.exam.models import Exam


async def create_exam(**kwargs):
    async with async_session() as session:
        obj = Exam(**kwargs)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj


async def get_exams():
    async with async_session() as session:
        stmt = select(Exam)
        result = await session.scalars(stmt)
        return result.all()


async def get_exam(exam_id: int):
    async with async_session() as session:
        stmt = select(Exam).where(Exam.exam_id == exam_id)
        return await session.scalar(stmt)


async def update_exam(exam_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Exam)
            .where(Exam.exam_id == exam_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_exam(exam_id)


async def delete_exam(exam_id: int):
    async with async_session() as session:
        stmt = delete(Exam).where(Exam.exam_id == exam_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}