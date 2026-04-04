from fastapi import APIRouter   # generate api routers from fastapi 

router = APIRouter()    # make the object or .....  from APi Routers


@router.get("/users")    
async def get_all_users():
    return {"data": "ALL users"}


@router.get("/users/me")
async def get_current_users():
    return {"data": "Current users"}


@router.get("/users/{user_id}")
async def get_current_users(user_id: int):
    return {"data": "Single users"}