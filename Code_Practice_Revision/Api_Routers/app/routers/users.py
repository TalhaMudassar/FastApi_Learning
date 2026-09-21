from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.dependencies import verify_token

# Router-level settings:
# 1. prefix: Common base path
# 2. tags: Swagger UI grouping
# 3. dependencies: Runs for EVERY route inside this router
# 4. responses: Common error schemas declared for documentation
router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(verify_token)],
    responses={404: {"description": "User Not Found"}},
)

fake_users_db = {
    1: {"name": "Alice", "role": "admin"},
    2: {"name": "Bob", "role": "member"},
}

class UserResponse(BaseModel):
    id: int
    name: str
    role: str

@router.get("/", response_model=list[UserResponse])
async def read_users():
    return [{"id": k, **v} for k, v in fake_users_db.items()]

# CRITICAL ORDERING RULE:
# /me MUST be defined BEFORE /{user_id}.
# If /{user_id} comes first, FastAPI evaluates "me" as an integer user_id and fails with 422!
@router.get("/me", response_model=UserResponse)
async def read_user_me():
    return {"id": 1, "name": "Current Logged-in User", "role": "admin"}

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: int):
    if user_id not in fake_users_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
    return {"id": user_id, **fake_users_db[user_id]}