from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# ==================================================
# Fake Database (In-Memory)
# ==================================================

product_db = {
    "1": {"id": "1", "name": "Laptop", "price": 999.99, "stock": 10, "is_active": True},
    "2": {"id": "2", "name": "Smart Phone", "price": 499.99, "stock": 50, "is_active": False},
}

# ==================================================
# Pydantic Model
# ==================================================

class Product(BaseModel):
    id: str
    name: str
    price: float
    description: Optional[str] = None
    tax: float = 15.0   # Default Tax Rate


# ==================================================
# 1. Exclude UNSET fields
#    ➜ Fields not provided in response will NOT appear
# ==================================================

@app.get(
    "/products/{product_id}",
    response_model=Product,
    response_model_exclude_unset=True
)
async def get_product(product_id: str):
    return product_db.get(product_id, {})


# ==================================================
# 2. Include ONLY specific fields
#    ➜ Only "name" and "price" will appear in response
# ==================================================

@app.get(
    "/products/{product_id}",
    response_model=Product,
    response_model_include={"name", "price"}
)
async def get_product(product_id: str):
    return product_db.get(product_id, {})


# ==================================================
# 3. Exclude specific fields
#    ➜ "tax" will NOT appear in response
# ==================================================

@app.get(
    "/products/{product_id}",
    response_model=Product,
    response_model_exclude={"tax"}
)
async def get_product(product_id: str):
    return product_db.get(product_id, {})
