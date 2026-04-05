from fastapi import FastAPI, Depends, Header, HTTPException
from typing import Annotated

# -------------------------------
# Global Dependency
# -------------------------------
async def verify_token(
    x_token: Annotated[str, Header()]
):
    if x_token != "my_secret_token":
        raise HTTPException(
            status_code=401,
            detail="Invalid X-Token"
        )

# -------------------------------
# App with Global Dependency
# -------------------------------
app = FastAPI(
    dependencies=[Depends(verify_token)]
)

# -------------------------------
# Routes
# -------------------------------
@app.get("/items")
async def read_items():
    return {"data": "All items"}

@app.get("/products")
async def read_products():
    return {"data": "All products"}
