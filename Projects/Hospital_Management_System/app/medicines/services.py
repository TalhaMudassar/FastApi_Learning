from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.medicines.models import Medicine
from app.medicines.schemas import MedicineCreate, MedicineUpdate, MedicinePatch

async def create_medicine(session: AsyncSession, data: MedicineCreate):
    medicine = Medicine(**data.model_dump())
    session.add(medicine)
    await session.commit()
    await session.refresh(medicine)
    return medicine

async def get_medicine_by_id(session: AsyncSession, id: int):
    medicine = await session.get(Medicine, id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

async def get_all_medicines(session: AsyncSession):
    result = await session.scalars(select(Medicine))
    return result.all()

async def update_medicine(session: AsyncSession, id: int, data: MedicineUpdate):
    medicine = await get_medicine_by_id(session, id)
    for key, value in data.model_dump().items():
        setattr(medicine, key, value)
    await session.commit()
    await session.refresh(medicine)
    return medicine

async def patch_medicine(session: AsyncSession, id: int, data: MedicinePatch):
    medicine = await get_medicine_by_id(session, id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medicine, key, value)
    await session.commit()
    await session.refresh(medicine)
    return medicine

async def delete_medicine(session: AsyncSession, id: int):
    medicine = await get_medicine_by_id(session, id)
    await session.delete(medicine)
    await session.commit()
    return {"message": "Medicine successfully deleted"}