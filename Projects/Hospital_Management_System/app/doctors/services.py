from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.doctors.models import Doctor
from app.doctors.schemas import DoctorCreate, DoctorUpdate, DoctorPatch

async def create_doctor(session: AsyncSession, data: DoctorCreate):
    doctor = Doctor(**data.model_dump())
    session.add(doctor)
    await session.commit()
    await session.refresh(doctor)
    return doctor

async def get_doctor_by_id(session: AsyncSession, id: int):
    doctor = await session.get(Doctor, id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

async def get_all_doctors(session: AsyncSession):
    result = await session.scalars(select(Doctor))
    return result.all()

async def update_doctor(session: AsyncSession, id: int, data: DoctorUpdate):
    doctor = await get_doctor_by_id(session, id)
    for key, value in data.model_dump().items():
        setattr(doctor, key, value)
    await session.commit()
    await session.refresh(doctor)
    return doctor

async def patch_doctor(session: AsyncSession, id: int, data: DoctorPatch):
    doctor = await get_doctor_by_id(session, id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor, key, value)
    await session.commit()
    await session.refresh(doctor)
    return doctor

async def delete_doctor(session: AsyncSession, id: int):
    doctor = await get_doctor_by_id(session, id)
    await session.delete(doctor)
    await session.commit()
    return {"message": "Doctor successfully deleted"}