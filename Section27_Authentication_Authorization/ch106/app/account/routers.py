from fastapi import APIRouter
from app.account.services import create_user
from app.account.models import UserCreate, UserOut
from app.db.config import SessionDep

router = APIRouter(prefix="/account" , tags=["Account"])

@router.post("/register", response_model=UserOut)
def register(session:SessionDep, user:UserCreate):
    return create_user(session,user)