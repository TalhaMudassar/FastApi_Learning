from fastapi import FastAPI
from typing import List
from pydantic import BaseModel

app = FastAPI()

# ==================================================
# Models
# ==================================================

class Product(BaseModel):
    id: int
    name: str
    price: float
    stock: int | None = None


class ProductOut(BaseModel):
    name: str
    price: float


# ==================================================
# Without Return Type Annotation we return anything we want we cannt restrict with the annotation
# ==================================================

@app.get("/no-type")
async def get_no_type():
    return [
        {"status": "OK"},
        {"status": 200}
    ]


# ==================================================
# With Return Type Annotation (Single Object)
# ==================================================

@app.get("/product")
async def get_product() -> Product:
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90,
        "stock": 4
    }


# stock is optional, so this also works
@app.get("/product-no-stock")
async def get_product_no_stock() -> Product:
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90
    }


# If you send extra field, FastAPI/Pydantic will still try to parse
# (Later you'll learn response_model to FILTER it)
@app.get("/product-extra")
async def get_product_extra() -> Product:
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90,
        "stock": 4,
        "description": "Extra field"
    }


# ==================================================
# Multiple Objects (List)
# ==================================================

@app.get("/products")
async def get_products() -> List[Product]:
    return [
        {
            "id": 1,
            "name": "Mobile",
            "price": 45.90,
            "stock": 4
        },
        {
            "id": 2,
            "name": "Q Mobile",
            "price": 87.57,
            "stock": 10
        }
    ]


# ==================================================
# POST with Return Type Annotation
# ==================================================

@app.post("/products")
async def create_product(product: Product) -> Product:
    return product


# ==================================================
# Restricting Output Using Another Model (Still Your Method)
# ==================================================

@app.post("/products/out")
async def create_product_out(product: Product) -> ProductOut:
    # It will return only name & price (based on ProductOut)
    return product


# ==================================================
# Better Example with Inheritance (User Input vs Output)
# ==================================================

class BaseUser(BaseModel):
    username: str
    fullname: str


class UserIn(BaseUser):
    password: str


@app.post("/user")
async def create_user(user: UserIn) -> BaseUser:
    # password will not appear because return type is BaseUser
    return user
