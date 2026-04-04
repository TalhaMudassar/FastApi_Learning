from fastapi import FastAPI,Depends,Header, HTTPException
from typing import Annotated

app = FastAPI()

# Dependencies  in path operation  Decorators
async def verify_token(x_token: Annotated[str, Header()]):
    if x_token != "my_secret_token":
        raise HTTPException(status_code=400,detail="X_token header invalid")
    
    
@app.get("/items",dependencies=[Depends(verify_token)])
async def read_items():
    return {"data":"All items "}
