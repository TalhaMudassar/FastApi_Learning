from fastapi import FastAPI,Depends
from typing import Annotated

app = FastAPI()

#Creating Dependency Class
class CommonQueryParams:
    def __init__(self, q:str| None = None, skip:int = 0 , limit : int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit
    
#Using Dependency in Endpoints
@app.get("/items/")
async def read_items(common:Annotated[CommonQueryParams, Depends(CommonQueryParams)]):
    return common   


@app.get("/users/")
async def read_items(common:Annotated[CommonQueryParams, Depends()]):
    return common   


#Create a type alias
CommonDep = Annotated[CommonQueryParams, Depends(CommonQueryParams)]

@app.get("/items")
async def read_items(common:CommonDep):
    return common


@app.get("/cants")
async def read_items(common:CommonDep):
    return common


          