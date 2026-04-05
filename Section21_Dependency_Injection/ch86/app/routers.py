from fastapi import APIRouter,Depends,Header,HTTPException
from typing import Annotated


async def verify_token(x_token: Annotated[str, Header()]):
    if x_token != "my_secret_token":
        raise HTTPException(status_code=400,detail="X_token header invalid")

# Dependencies for a group of path parameter 
routers = APIRouter(dependencies=[Depends(verify_token)])

# Method 2: Dependencies for a group of path parameter 
# routers = APIRouter()

@routers.get("/items")
async def read_items():
    return {"data": "All Items"}