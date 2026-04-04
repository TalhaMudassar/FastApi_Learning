from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.categories.models import Category
from app.categories.schemas import CategoryCreate, CategoryUpdate, CategoryPatch


# ===============================
# Create
# ===============================
async def create_category(session: AsyncSession, data: CategoryCreate):
    category = Category(name=data.name)

    session.add(category)
    await session.commit()
    await session.refresh(category)

    return category


# ===============================
# Get One
# ===============================
async def get_category(session: AsyncSession, category_id: int):
    category = await session.get(Category, category_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


# ===============================
# Get All
# ===============================
async def get_categories(session: AsyncSession):
    result = await session.scalars(select(Category))
    return result.all()


# ===============================
# Update (PUT)
# ===============================
async def update_category(session: AsyncSession, category_id: int, data: CategoryUpdate):
    category = await get_category(session, category_id)

    category.name = data.name

    await session.commit()
    await session.refresh(category)

    return category


# ===============================
# Patch
# ===============================
async def patch_category(session: AsyncSession, category_id: int, data: CategoryPatch):
    category = await get_category(session, category_id)

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(category, key, value)

    await session.commit()
    await session.refresh(category)

    return category


# ===============================
# Delete
# ===============================
async def delete_category(session: AsyncSession, category_id: int):
    category = await get_category(session, category_id)

    await session.delete(category)
    await session.commit()

    return {"message": "Category deleted successfully"}