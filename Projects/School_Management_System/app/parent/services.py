from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.parent.models import Parent


# INSERT
async def create_parent(**kwargs):
    async with async_session() as session:
        parent = Parent(**kwargs)
        session.add(parent)
        await session.commit()
        await session.refresh(parent)
        return parent


# READ ALL
async def get_parents():
    async with async_session() as session:
        stmt = select(Parent)
        result = await session.scalars(stmt)
        return result.all()


# GET SINGLE
async def get_parent(parent_id: int):
    async with async_session() as session:
        stmt = select(Parent).where(Parent.parent_id == parent_id)
        return await session.scalar(stmt)


# UPDATE
async def update_parent(parent_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Parent)
            .where(Parent.parent_id == parent_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_parent(parent_id)


# DELETE
async def delete_parent(parent_id: int):
    async with async_session() as session:
        stmt = delete(Parent).where(Parent.parent_id == parent_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}
    