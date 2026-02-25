from fastapi import FastAPI
from typing import List, Any
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
# 1. Without Return Type Annotation or response_model
#    ➜ We can return ANYTHING, no validation, no filtering
# ==================================================

@app.get("/no-type")
async def get_no_type():
    return [
        {"status": "OK"},
        {"status": 200},
        "random string",
        12345
    ]


# ==================================================
# 2. Using response_model (Single Object)
#    ➜ FastAPI will:
#       - Validate output
#       - Filter extra fields
#       - Generate correct docs
# ==================================================

@app.get("/product", response_model=Product)
async def get_product():
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90,
        "stock": 4
    }


# stock is optional, so this is still valid
@app.get("/product-no-stock", response_model=Product)
async def get_product_no_stock():
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90
    }


# Extra field "description" will be REMOVED from response
@app.get("/product-extra", response_model=Product)
async def get_product_extra():
    return {
        "id": 1,
        "name": "Mobile",
        "price": 45.90,
        "stock": 4,
        "description": "This will NOT appear in response"
    }


# ==================================================
# 3. Multiple Objects (List of Models)
# ==================================================

@app.get("/products", response_model=List[Product])
async def get_products():
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
# 4. POST with response_model
#    ➜ Input is Product
#    ➜ Output is validated & filtered as Product
# ==================================================

@app.post("/products", response_model=Product)
async def create_product(product: Product):
    return product


# ==================================================
# 5. Restricting Output Using Another Model
#    ➜ Input: Product (has id, name, price, stock)
#    ➜ Output: ProductOut (ONLY name, price)
# ==================================================

@app.post("/products/out", response_model=ProductOut)
async def create_product_out(product: Product):
    # Even if product has id & stock, response will only show:
    # name, price
    return product


# ==================================================
# 6. Better Example: User Input vs User Output (Security)
# ==================================================

class BaseUser(BaseModel):
    username: str
    fullname: str


class UserIn(BaseUser):
    password: str  # Sensitive field (should not be returned)


@app.post("/user", response_model=BaseUser)
async def create_user(user: UserIn):
    # password will be REMOVED from response automatically
    return user


# ==================================================
# 7. Using -> Any with response_model
#    ➜ Sometimes IDE or typing needs Any
#    ➜ response_model still controls the output
# ==================================================

@app.post("/products/any", response_model=Product)
async def create_product_any(product: Product) -> Any:
    return product


# ==================================================
# 8. Disabling response_model Filtering
#    ➜ response_model=None means:
#       - No filtering
#       - No validation on output
# ==================================================

@app.post("/products/raw", response_model=None)
async def create_product_raw(product: Product) -> Any:
    return {
        "message": "Raw response",
        "product": product,
        "extra": "This will NOT be filtered"
    }
