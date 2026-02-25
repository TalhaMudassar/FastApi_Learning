from fastapi import FastAPI
from app.user import services as sc
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str
    
@app.post("/users")
async def data_inserting(user:UserCreate):
    users = await sc.insert_data_user(name=user.name,email=user.email)
    return users

@app.get("/users")
async def get_user_data():
    users = await sc.read_user_data()
    return users


