from app.db.config  import async_session
from app.user.models import User
from sqlalchemy import select

async def insert_data_user(name:str  , email:str):
    async with async_session() as session:
        user = User(name=name, email=email)
        session.add(user)
        await session.commit()
        
async def read_user_data():
    async with async_session() as session:
        stmt = select(User)
        users = await session.scalars(stmt)
        return users.all()
    
        