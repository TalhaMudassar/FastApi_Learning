import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, UploadFile, status
from pathlib import Path

from app.product.models import Category, Product
from app.product.schemas import (
    CategoryCreate, 
    CategoryUpdate, 
    ProductCreate, 
    ProductUpdate
)
from app.product.utils import generate_slug, save_upload_file

################# Category ###################
async def create_category(session: AsyncSession, category_data: CategoryCreate) -> Category:
    stmt = select(Category).where(Category.name == category_data.name)
    result = await session.scalars(stmt)
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Category with this name already exists"
        )

    new_category = Category(name=category_data.name)
    session.add(new_category)
    await session.commit()
    await session.refresh(new_category)
    return new_category

async def get_all_categories(session: AsyncSession) -> Sequence[Category]:
    stmt = select(Category).order_by(Category.name.asc())
    result = await session.scalars(stmt)
    return result.all()

async def update_category(session: AsyncSession, category_id: int, category_data: CategoryUpdate) -> Category:
    category = await session.get(Category, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )

    stmt = select(Category).where(Category.name == category_data.name, Category.id != category_id)
    result = await session.scalars(stmt)
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Category with this name already exists"
        )

    category.name = category_data.name
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category

async def delete_category(session: AsyncSession, category_id: int) -> bool:
    category = await session.get(Category, category_id)
    if not category:
        return False
    await session.delete(category)
    await session.commit()
    return True

################# Product ###################
async def create_product(
    session: AsyncSession, 
    data: ProductCreate, 
    image_url: UploadFile | None = None
) -> Product:
    image_path = await save_upload_file(image_url, "images")

    categories = []
    if data.category_ids:
        category_stmt = select(Category).where(Category.id.in_(data.category_ids))
        category_result = await session.scalars(category_stmt)
        categories = list(category_result.all())

    base_slug = generate_slug(data.title)
    slug = base_slug
    existing_product = await session.scalars(select(Product).where(Product.slug == slug))
    if existing_product.first():
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

    product_dict = data.model_dump(exclude={"category_ids"})
    new_product = Product(
        **product_dict, 
        slug=slug, 
        image_url=image_path, 
        categories=categories
    )
    session.add(new_product)
    await session.commit()

    stmt = (
        select(Product)
        .where(Product.id == new_product.id)
        .options(selectinload(Product.categories))
    )
    reloaded_product = await session.scalars(stmt)
    return reloaded_product.first()

async def get_all_products(
    session: AsyncSession,
    category_names: list[str] | None = None,
    limit: int = 5,
    page: int = 1
) -> dict:
    stmt = select(Product).options(selectinload(Product.categories))

    if category_names:
        stmt = stmt.join(Product.categories).where(Category.name.in_(category_names)).distinct()

    count_stmt = stmt.with_only_columns(func.count(func.distinct(Product.id))).order_by(None)
    total = (await session.scalar(count_stmt)) or 0

    stmt = stmt.order_by(Product.id.desc()).limit(limit).offset((page - 1) * limit)

    result = await session.scalars(stmt)
    products = list(result.all())

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": products
    }

async def get_product_by_slug(session: AsyncSession, slug: str) -> Product | None:
    stmt = (
        select(Product)
        .options(selectinload(Product.categories))
        .where(Product.slug == slug)
    )
    result = await session.scalars(stmt)
    return result.first()

async def search_products(
    session: AsyncSession,
    category_names: list[str] | None = None,
    title: str | None = None,
    description: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    limit: int = 5,
    page: int = 1
) -> dict:
    stmt = select(Product).options(selectinload(Product.categories))

    if category_names:
        stmt = stmt.join(Product.categories).where(Category.name.in_(category_names)).distinct()

    filters = []

    if title:
        filters.append(Product.title.like(f"%{title}%"))

    if description:
        filters.append(Product.description.like(f"%{description}%"))

    if min_price is not None:
        filters.append(Product.price >= min_price)

    if max_price is not None:
        filters.append(Product.price <= max_price)

    if filters:
        stmt = stmt.where(and_(*filters))

    count_stmt = stmt.with_only_columns(func.count(func.distinct(Product.id))).order_by(None)
    total = (await session.scalar(count_stmt)) or 0

    stmt = stmt.order_by(Product.id.desc()).limit(limit).offset((page - 1) * limit)

    result = await session.scalars(stmt)
    products = list(result.all())

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": products
    }

async def update_product_by_id(
    session: AsyncSession,
    product_id: int,
    data: ProductUpdate,
    image_url: UploadFile | None = None
) -> Product | None:
    stmt = (
        select(Product)
        .options(selectinload(Product.categories))
        .where(Product.id == product_id)
    )
    result = await session.scalars(stmt)
    product = result.first()

    if not product:
        return None
    
    # 1. Update categories relationship if explicitly provided
    if data.category_ids is not None:
        category_stmt = select(Category).where(Category.id.in_(data.category_ids))
        category_result = await session.scalars(category_stmt)
        product.categories = list(category_result.all())

    # 2. Update title and refresh slug if title changed
    if data.title and data.title != product.title:
        base_slug = generate_slug(data.title)
        slug = base_slug
        existing_product = await session.scalars(
            select(Product).where(Product.slug == slug, Product.id != product_id)
        )
        if existing_product.first():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        product.slug = slug

    # 3. Update scalar fields (excluding category_ids)
    update_data = data.model_dump(exclude={"category_ids", "image_url"}, exclude_none=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    # 4. Save new image if provided
    if image_url is not None:
        image_path = await save_upload_file(image_url, "images")
        if image_path:
            product.image_url = image_path

    await session.commit()
    await session.refresh(product)
    return product



async def delete_product(session: AsyncSession, product_id: int) -> bool:
    # 1. Fetch product by primary key
    product = await session.get(Product, product_id)
    if not product:
        return False

    # 2. Delete physical image file from storage if it exists
    if product.image_url:
        file_path = Path(product.image_url)
        file_path.unlink(missing_ok=True)

    # 3. Delete database record and commit
    await session.delete(product)
    await session.commit()
    return True