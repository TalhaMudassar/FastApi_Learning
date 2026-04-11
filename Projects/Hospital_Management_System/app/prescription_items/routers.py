from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.prescription_items.schemas import PrescriptionItemCreate, PrescriptionItemOut, PrescriptionItemUpdate, PrescriptionItemPatch
from app.prescription_items import services

# Note: The prefix here is usually hyphenated or combined in RESTful APIs
router = APIRouter(prefix="/prescription-items", tags=["Prescription Items"])

@router.post("/", response_model=PrescriptionItemOut, status_code=status.HTTP_201_CREATED)
async def create_prescription_item(session: SessionDep, data: PrescriptionItemCreate):
    return await services.create_prescription_item(session, data)

@router.get("/", response_model=List[PrescriptionItemOut])
async def get_all_prescription_items(session: SessionDep):
    return await services.get_all_prescription_items(session)

@router.get("/{item_id}", response_model=PrescriptionItemOut)
async def get_prescription_item(session: SessionDep, item_id: int):
    return await services.get_prescription_item_by_id(session, item_id)

@router.put("/{item_id}", response_model=PrescriptionItemOut)
async def update_prescription_item(session: SessionDep, item_id: int, data: PrescriptionItemUpdate):
    return await services.update_prescription_item(session, item_id, data)

@router.patch("/{item_id}", response_model=PrescriptionItemOut)
async def patch_prescription_item(session: SessionDep, item_id: int, data: PrescriptionItemPatch):
    return await services.patch_prescription_item(session, item_id, data)

@router.delete("/{item_id}")
async def delete_prescription_item(session: SessionDep, item_id: int):
    return await services.delete_prescription_item(session, item_id)