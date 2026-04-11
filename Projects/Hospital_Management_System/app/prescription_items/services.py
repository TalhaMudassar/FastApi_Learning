from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
# 🚨 CHANGED: Importing PrescriptionItem
from app.prescription_items.models import PrescriptionItem
from app.prescription_items.schemas import PrescriptionItemCreate, PrescriptionItemUpdate, PrescriptionItemPatch

async def create_prescription_item(session: AsyncSession, data: PrescriptionItemCreate):
    # 🚨 CHANGED: Using PrescriptionItem
    prescription_item = PrescriptionItem(**data.model_dump())
    session.add(prescription_item)
    await session.commit()
    await session.refresh(prescription_item)
    return prescription_item

async def get_prescription_item_by_id(session: AsyncSession, id: int):
    # 🚨 CHANGED: Using PrescriptionItem
    prescription_item = await session.get(PrescriptionItem, id)
    if not prescription_item:
        raise HTTPException(status_code=404, detail="Prescription item not found")
    return prescription_item

async def get_all_prescription_items(session: AsyncSession):
    # 🚨 CHANGED: Using PrescriptionItem
    result = await session.scalars(select(PrescriptionItem))
    return result.all()

async def update_prescription_item(session: AsyncSession, id: int, data: PrescriptionItemUpdate):
    prescription_item = await get_prescription_item_by_id(session, id)
    for key, value in data.model_dump().items():
        setattr(prescription_item, key, value)
    await session.commit()
    await session.refresh(prescription_item)
    return prescription_item

async def patch_prescription_item(session: AsyncSession, id: int, data: PrescriptionItemPatch):
    prescription_item = await get_prescription_item_by_id(session, id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prescription_item, key, value)
    await session.commit()
    await session.refresh(prescription_item)
    return prescription_item

async def delete_prescription_item(session: AsyncSession, id: int):
    prescription_item = await get_prescription_item_by_id(session, id)
    await session.delete(prescription_item)
    await session.commit()
    return {"message": "Prescription item successfully deleted"}