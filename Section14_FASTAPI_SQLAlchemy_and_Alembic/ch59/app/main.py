from fastapi import FastAPI
from app.user import services as user_services
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str
    
@app.post("/user")
def user_create(user: UserCreate):
    user_services.create_user(name=user.name, email = user.email)
    return {"status":"created"}

@app.get("/users")
def all_users():
    user = user_services.read_user()
    return user