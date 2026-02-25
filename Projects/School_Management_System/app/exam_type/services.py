from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.exam_type.models import ExamType


async def create_exam_type(**kwargs):
    async with async_session() as session:
        obj = ExamType(**kwargs)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj


async def get_exam_types():
    async with async_session() as session:
        stmt = select(ExamType)
        result = await session.scalars(stmt)
        return result.all()


async def get_exam_type(exam_type_id: int):
    async with async_session() as session:
        stmt = select(ExamType).where(
            ExamType.exam_type_id == exam_type_id
        )
        return await session.scalar(stmt)


async def update_exam_type(exam_type_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(ExamType)
            .where(ExamType.exam_type_id == exam_type_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_exam_type(exam_type_id)


async def delete_exam_type(exam_type_id: int):
    async with async_session() as session:
        stmt = delete(ExamType).where(
            ExamType.exam_type_id == exam_type_id
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}