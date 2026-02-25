from fastapi import FastAPI

# Create FastAPI application instance
app = FastAPI()


# =========================
# GET REQUESTS
# =========================

# GET → Read or Fetch ALL products
@app.get("/product")
async def all_products():
    """
    This endpoint returns all products.
    HTTP Method: GET
    URL: /product
    """
    return {"response": "All Products"}


# GET → Read or Fetch a SINGLE product using Path Parameter
@app.get("/product/{product_id}")
async def get_single_product(product_id: int):
    """
    Path Parameter:
    product_id -> extracted from the URL

    Type Casting:
    product_id: int ensures only integer values are allowed
    """
    return {
        "response": "Single Product Data",
        "product_id": product_id
    }


# =========================
# POST REQUEST
# =========================

# POST → Create or Insert new product
@app.post("/product")
async def create_product(new_product: dict):
    """
    Request Body:
    new_product -> data sent by the client (JSON)

    POST is used to CREATE new data
    """
    return {
        "response": "Product created successfully",
        "new_product": new_product
    }


# =========================
# PUT REQUEST
# =========================

# PUT → Update COMPLETE product data
@app.put("/product/{product_id}")
async def update_product(product_id: int, new_updated_product: dict):
    """
    PUT replaces the entire product data

    Path Parameter:
    product_id -> identifies which product to update
    """
    return {
        "response": "Product updated completely",
        "product_id": product_id,
        "updated_product": new_updated_product
    }


# =========================
# PATCH REQUEST
# =========================

# PATCH → Update PARTIAL product data
@app.patch("/product/{product_id}")
async def update_partial_product(product_id: int, new_updated_partialdata: dict):
    """
    PATCH updates only specific fields of a product
    """
    return {
        "response": "Product partially updated",
        "product_id": product_id,
        "updated_fields": new_updated_partialdata
    }


# =========================
# DELETE REQUEST
# =========================

# DELETE → Remove product
@app.delete("/product/{product_id}")
async def delete_product(product_id: int):
    """
    DELETE removes a product using product_id
    """
    return {
        "response": "Product deleted successfully",
        "product_id": product_id
    }
