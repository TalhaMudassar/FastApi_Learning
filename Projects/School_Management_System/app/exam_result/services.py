from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.exam_result.models import ExamResult


# CREATE (Insert marks)
async def create_exam_result(exam_id: int, student_id: int, course_id: int, marks: str):
    async with async_session() as session:
        obj = ExamResult(
            exam_id=exam_id,
            student_id=student_id,
            course_id=course_id,
            marks=marks
        )
        session.add(obj)
        await session.commit()
        return obj


# READ ALL
async def get_exam_results():
    async with async_session() as session:
        stmt = select(ExamResult)
        result = await session.scalars(stmt)
        return result.all()


# GET SINGLE
async def get_exam_result(exam_id: int, student_id: int, course_id: int):
    async with async_session() as session:
        stmt = select(ExamResult).where(
            ExamResult.exam_id == exam_id,
            ExamResult.student_id == student_id,
            ExamResult.course_id == course_id
        )
        return await session.scalar(stmt)


# UPDATE MARKS
async def update_exam_result(exam_id: int, student_id: int, course_id: int, marks: str):
    async with async_session() as session:
        stmt = (
            update(ExamResult)
            .where(
                ExamResult.exam_id == exam_id,
                ExamResult.student_id == student_id,
                ExamResult.course_id == course_id
            )
            .values(marks=marks)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "updated"}


# DELETE
async def delete_exam_result(exam_id: int, student_id: int, course_id: int):
    async with async_session() as session:
        stmt = delete(ExamResult).where(
            ExamResult.exam_id == exam_id,
            ExamResult.student_id == student_id,
            ExamResult.course_id == course_id
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}