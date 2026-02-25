from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.classroom_student.models import ClassroomStudent


# CREATE (Assign student to classroom)
async def create_classroom_student(classroom_id: int, student_id: int):
    async with async_session() as session:
        obj = ClassroomStudent(
            classroom_id=classroom_id,
            student_id=student_id
        )
        session.add(obj)
        await session.commit()
        return obj


# READ ALL
async def get_classroom_students():
    async with async_session() as session:
        stmt = select(ClassroomStudent)
        result = await session.scalars(stmt)
        return result.all()


# GET SINGLE
async def get_classroom_student(classroom_id: int, student_id: int):
    async with async_session() as session:
        stmt = select(ClassroomStudent).where(
            ClassroomStudent.classroom_id == classroom_id,
            ClassroomStudent.student_id == student_id
        )
        return await session.scalar(stmt)


# DELETE (Remove student from classroom)
async def delete_classroom_student(classroom_id: int, student_id: int):
    async with async_session() as session:
        stmt = delete(ClassroomStudent).where(
            ClassroomStudent.classroom_id == classroom_id,
            ClassroomStudent.student_id == student_id
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}