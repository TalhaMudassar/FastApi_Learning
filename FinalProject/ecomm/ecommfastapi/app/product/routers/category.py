from fastapi import APIRouter, Depends, HTTPException, status
from app.account.models import User
from app.db.config import SessionDep
from app.product.schemas import CategoryCreate, CategoryUpdate, CategoryOut
from app.account.deps import require_admin
from app.product.services import (
    create_category, 
    get_all_categories, 
    update_category,
    delete_category
)

router = APIRouter()

@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def category_create(
    session: SessionDep, 
    category: CategoryCreate, 
    admin_user: User = Depends(require_admin)
):
    return await create_category(session, category)

@router.get("/", response_model=list[CategoryOut])
async def list_categories(session: SessionDep):
    return await get_all_categories(session)

@router.put("/{category_id}", response_model=CategoryOut)
async def category_update(
    session: SessionDep,
    category_id: int,
    category: CategoryUpdate,
    admin_user: User = Depends(require_admin)
):
    return await update_category(session, category_id, category)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def category_delete(
    session: SessionDep, 
    category_id: int, 
    admin_user: User = Depends(require_admin)
):
    success = await delete_category(session, category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )   