from fastapi import FastAPI,Depends
from typing import Annotated
app = FastAPI()


#Creating Dependency Injection
async def common_parameter(q : str | None = None , skip: int = 0, limit : int = 100):
    return {"q": q , "skip":skip , "limit":limit }


#Using Dependency in endpoints
@app.get("/items")
async def read_items(common: Annotated[dict,Depends(common_parameter)]):
    return common


@app.get("/users")
async def read_users(common:Annotated[dict, Depends(common_parameter)]):
    return common


#Creating a Type Alias
CommonDep = Annotated[dict , Depends(common_parameter)]



@app.get("/product")
async def read_users(common : CommonDep):
    return common