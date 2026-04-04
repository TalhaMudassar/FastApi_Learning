from fastapi import FastAPI, Depends
from typing import Annotated

app = FastAPI()

#Sync Dependency
def sync_dep():
    return {"message":"i am sync"}

#Async Dependency
async def async_dep():
    return {"return": "i am async"}


@app.get("/test/")
async def test(
    sync_result: Annotated[dict,Depends(sync_dep)],
    async_result: Annotated[dict,Depends(async_dep)]
    ):
    return {"sync":sync_result, "async":async_result}