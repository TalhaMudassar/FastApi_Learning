from app.db.config import SessionLocal
from app.user.models import User
from sqlalchemy import select

# Insert Or Create user
def create_user(name:str,email:str):
    with SessionLocal() as session:
        user  = User(name=name,email=email)
        session.add(user)
        session.commit()
        

# Read All Users
def read_user():
    with SessionLocal() as session:
        stmt = select(User)
        users = session.scalars(stmt)
        return users.all()
    

