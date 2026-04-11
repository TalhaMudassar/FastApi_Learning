from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.patients.models import Patient
from app.patients.schemas import PatientCreate, PatientUpdate, PatientPatch

async def create_patient(session: AsyncSession, data: PatientCreate):
    patient = Patient(**data.model_dump())
    session.add(patient)
    await session.commit()
    await session.refresh(patient)
    return patient

async def get_patient_by_id(session: AsyncSession, id: int):
    patient = await session.get(Patient, id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

async def get_all_patients(session: AsyncSession):
    result = await session.scalars(select(Patient))
    return result.all()

async def update_patient(session: AsyncSession, id: int, data: PatientUpdate):
    patient = await get_patient_by_id(session, id)
    for key, value in data.model_dump().items():
        setattr(patient, key, value)
    await session.commit()
    await session.refresh(patient)
    return patient

async def patch_patient(session: AsyncSession, id: int, data: PatientPatch):
    patient = await get_patient_by_id(session, id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    await session.commit()
    await session.refresh(patient)
    return patient

async def delete_patient(session: AsyncSession, id: int):
    patient = await get_patient_by_id(session, id)
    await session.delete(patient)
    await session.commit()
    return {"message": "Patient successfully deleted"}