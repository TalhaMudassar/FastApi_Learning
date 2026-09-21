from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)

class Item(BaseModel):
    id: str
    title: str

items_db = {"item_1": "Mechanical Keyboard", "item_2": "Ergonomic Mouse"}

@router.get("/")
async def read_items():
    return items_db

# You can add route-specific tags or additional custom responses
@router.get(
    "/{item_id}",
    responses={
        403: {"description": "Operation forbidden"},
        404: {"description": "Item not found in inventory"}
    }
)
async def read_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return {"item_id": item_id, "name": items_db[item_id]}