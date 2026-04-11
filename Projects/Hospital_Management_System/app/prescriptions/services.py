from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.prescriptions.models import Prescription
from app.prescriptions.schemas import PrescriptionCreate, PrescriptionUpdate, PrescriptionPatch

async def create_prescription(session: AsyncSession, data: PrescriptionCreate):
    prescription = Prescription(**data.model_dump())
    session.add(prescription)
    await session.commit()
    await session.refresh(prescription)
    return prescription

async def get_prescription_by_id(session: AsyncSession, id: int):
    prescription = await session.get(Prescription, id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

async def get_all_prescriptions(session: AsyncSession):
    result = await session.scalars(select(Prescription))
    return result.all()

async def update_prescription(session: AsyncSession, id: int, data: PrescriptionUpdate):
    prescription = await get_prescription_by_id(session, id)
    for key, value in data.model_dump().items():
        setattr(prescription, key, value)
    await session.commit()
    await session.refresh(prescription)
    return prescription

async def patch_prescription(session: AsyncSession, id: int, data: PrescriptionPatch):
    prescription = await get_prescription_by_id(session, id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prescription, key, value)
    await session.commit()
    await session.refresh(prescription)
    return prescription

async def delete_prescription(session: AsyncSession, id: int):
    prescription = await get_prescription_by_id(session, id)
    await session.delete(prescription)
    await session.commit()
    return {"message": "Prescription successfully deleted"}