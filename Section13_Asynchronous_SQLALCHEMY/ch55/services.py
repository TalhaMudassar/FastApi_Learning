from db import async_session
from models import User
from sqlalchemy import select

# Insert or Create User
async def create_user(name:str ,email:str):
    async with async_session() as session:
        user = User(name=name,email=email)
        session.add(user)
        await session.commit() 
        
        
# Read User data by id 
async def get_user_by_id(user_id:int):
    async with async_session() as session:
        user = await session.get(User,user_id)
        return user
    
# Read all  users 
async def get_all_users():
    async with async_session() as session:
        stmt = select(User)
        user = await session.scalars(stmt)
        return user.all()
    
# Update User email
async def update_user_email(user_id:int, new_email:str):
    async with async_session() as session:
        user = await session.get(User,user_id)
        if user:
            user.email = new_email
            await session.commit()
        return user
    
    
# Delete the user 
async def delete_user(user_id:int):
    async with async_session() as session:
        user = await session.get(User,user_id)
        if user:
            await session.delete(user)
            await session.commit()
    
    
        
    