from fastapi import FastAPI, status, HTTPException

app = FastAPI()

# =====================================
# IN-MEMORY DATABASE (FAKE DB)
# =====================================
PRODUCT = [
    {
        "id": 1,
        "title": "Fjallraven Backpack",
        "price": 109.95,
        "description": "Slim-fitting style..."
    },
    {
        "id": 2,
        "title": "Mens Casual T-Shirts",
        "price": 22.30,
        "description": "Premium slim fit t-shirt..."
    }
]


# =====================================
# READ → FETCH ALL PRODUCTS
# =====================================
# 200 OK → request successful
@app.get("/product", status_code=status.HTTP_200_OK)
async def all_products():
    return PRODUCT


# =====================================
# READ → FETCH SINGLE PRODUCT
# =====================================
# 200 OK → found
# 404 NOT FOUND → product does not exist
@app.get("/product/{product_id}", status_code=status.HTTP_200_OK)
async def single_product(product_id: int):
    for product in PRODUCT:
        if product["id"] == product_id:
            return product

    # Client error → resource not found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found"
    )


# =====================================
# CREATE → ADD NEW PRODUCT
# =====================================
# 201 CREATED → new resource created
@app.post("/product", status_code=status.HTTP_201_CREATED)
async def create_product(new_product: dict):
    PRODUCT.append(new_product)
    return {
        "message": "Product created successfully",
        "product": new_product
    }


# =====================================
# UPDATE → FULL UPDATE (PUT)
# =====================================
# 200 OK → update successful and returning data
# 204 NO CONTENT → update successful but returning nothing
@app.put("/product/{product_id}", status_code=status.HTTP_200_OK)
async def update_product(product_id: int, new_update_product: dict):
    for index, product in enumerate(PRODUCT):
        if product["id"] == product_id:
            PRODUCT[index] = new_update_product
            return {
                "message": "Product fully updated",
                "updated_product": new_update_product
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found"
    )


# =====================================
# UPDATE → PARTIAL UPDATE (PATCH)
# =====================================
# 200 OK → partial update successful
@app.patch("/product/{product_id}", status_code=status.HTTP_200_OK)
async def update_partial_product(product_id: int, new_update_product: dict):
    for product in PRODUCT:
        if product["id"] == product_id:
            product.update(new_update_product)
            return {
                "message": "Product partially updated",
                "updated_fields": new_update_product
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found"
    )


# =====================================
# DELETE → REMOVE PRODUCT
# =====================================
# 204 NO CONTENT → delete successful, no response body
@app.delete("/product/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int):
    for index, product in enumerate(PRODUCT):
        if product["id"] == product_id:
            PRODUCT.pop(index)
            return  # ❌ MUST NOT return body for 204

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found"
    )
