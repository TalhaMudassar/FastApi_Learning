from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# ==========================================================
# 1) WITHOUT PYDANTIC (NOT RECOMMENDED)
# ==========================================================
# - new_product is just a dict
# - No validation
# - Any shape of data is accepted

@app.post("/product/raw")
async def create_product_raw(new_product: dict):
    return {
        "new_product": new_product
    }


# ==========================================================
# 2) WITH PYDANTIC (RECOMMENDED WAY ✅)
# ==========================================================
# - Automatic validation
# - Automatic docs in /docs
# - Type safety
# - Cleaner code

class Product(BaseModel):
    id: int
    name: str
    price: float
    stock: str | None = None   # Optional field


@app.post("/product")
async def create_product(new_product: Product):
    return new_product


# ==========================================================
# 3) ACCESS MODEL ATTRIBUTES INSIDE FUNCTION
# ==========================================================
# - Pydantic model acts like a normal Python object

@app.post("/product/read")
async def create_product_read(new_product: Product):
    print(new_product.id)
    print(new_product.name)
    print(new_product.price)
    print(new_product.stock)
    return new_product


# ==========================================================
# 4) ADD CALCULATED / EXTRA FIELDS (NOT IN MODEL)
# ==========================================================
# - Convert model to dict using .model_dump()
# - Add new calculated fields (e.g., tax)

@app.post("/product/with-tax")
async def create_product_with_tax(new_product: Product):
    product_dict = new_product.model_dump()   # Convert model to dict

    price_with_tax = new_product.price + (new_product.price * 18 / 100)  # 18% tax
    product_dict.update({"price_with_tax": price_with_tax})

    return product_dict


# ==========================================================
# 5) COMBINE REQUEST BODY + PATH PARAMETER
# ==========================================================
# - product_id comes from URL
# - new_updated_product comes from request body

@app.put("/product/{product_id}")
async def update_product(product_id: int, new_updated_product: Product):
    return {
        "product_id": product_id,
        "new_updated_product": new_updated_product
    }


# ==========================================================
# 6) ADD QUERY PARAMETER WITH REQUEST BODY
# ==========================================================
# - product_id → path parameter
# - new_updated_product → request body (Pydantic model)
# - discount → query parameter (not in model, not in path)

@app.put("/products/{product_id}")
async def update_product_with_discount(
    product_id: int,
    new_updated_product: Product,
    discount: float | None = None
):
    return {
        "product_id": product_id,
        "discount": discount,
        "new_updated_product": new_updated_product
    }




