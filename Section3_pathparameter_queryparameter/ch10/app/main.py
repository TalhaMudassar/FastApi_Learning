from fastapi import FastAPI

app = FastAPI()

# =====================================
# IN-MEMORY DATABASE (LIST OF DICTS)
# =====================================
# This acts like a fake database for learning purposes

PRODUCT = [
    {
        "id": 1,
        "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        "price": 109.95,
        "description": "Slim-fitting style, contrast raglan long sleeve..."
    },
    {
        "id": 2,
        "title": "Mens Casual Premium Slim Fit T-Shirts",
        "price": 22.30,
        "description": "Transform your look with this premium slim fit t-shirt..."
    },
    {
        "id": 3,
        "title": "John Hardy Women's Legends Naga Gold & Silver Bracelet",
        "price": 695.00,
        "description": "From our Legends Collection..."
    },
    {
        "id": 4,
        "title": "WD 2TB Elements Portable External Hard Drive - USB 3.0",
        "price": 64.00,
        "description": "USB 3.0 and USB 2.0 Compatibility..."
    }
]


# =====================================
# READ → FETCH ALL PRODUCTS
# =====================================
@app.get("/product")
async def all_products():
    """
    GET all products
    """
    return PRODUCT


# =====================================
# READ → FETCH SINGLE PRODUCT
# =====================================
@app.get("/product/{product_id}")
async def single_product(product_id: int):
    """
    GET a single product by ID
    """
    for product in PRODUCT:
        if product["id"] == product_id:
            return product

    return {"error": "Product not found"}


# =====================================
# CREATE → ADD NEW PRODUCT
# =====================================
@app.post("/product")
async def create_product(new_product: dict):
    """
    POST → Create a new product
    """
    PRODUCT.append(new_product)
    return {
        "status": "Created",
        "new_product": new_product
    }


# =====================================
# UPDATE → FULL UPDATE (PUT)
# =====================================
@app.put("/product/{product_id}")
async def update_product(product_id: int, new_update_product: dict):
    """
    PUT → Replace the entire product data
    """
    for index, product in enumerate(PRODUCT):
        if product["id"] == product_id:
            PRODUCT[index] = new_update_product
            return {
                "status": "Updated",
                "product_id": product_id,
                "updated_data": new_update_product
            }

    return {"error": "Product not found"}


# =====================================
# UPDATE → PARTIAL UPDATE (PATCH)
# =====================================
@app.patch("/product/{product_id}")
async def update_partial_product(product_id: int, new_update_product: dict):
    """
    PATCH → Update only specific fields
    """
    for product in PRODUCT:
        if product["id"] == product_id:
            product.update(new_update_product)
            return {
                "status": "Partially Updated",
                "product_id": product_id,
                "updated_fields": new_update_product
            }

    return {"error": "Product not found"}


# =====================================
# DELETE → REMOVE PRODUCT
# =====================================
@app.delete("/product/{product_id}")
async def delete_product(product_id: int):
    """
    DELETE → Remove a product
    """
    for index, product in enumerate(PRODUCT):
        if product["id"] == product_id:
            PRODUCT.pop(index)
            return {
                "status": "Deleted",
                "product_id": product_id
            }

    return {"error": "Product not found"}
