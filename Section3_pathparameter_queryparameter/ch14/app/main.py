from fastapi import FastAPI, Path, Query
from typing import Annotated

app = FastAPI()

# =====================================
# SAMPLE IN-MEMORY DATA
# =====================================
PRODUCTS = [
    {
        "id": 1,
        "title": "Ravan Backpack",
        "price": 109.95,
        "description": "Perfect for everyday use and forest walks."
    },
    {
        "id": 2,
        "title": "Slim Fit T-Shirts",
        "price": 22.3,
        "description": "Comfortable, slim-fitting casual shirts."
    },
    {
        "id": 3,
        "title": "Cotton Jacket",
        "price": 55.99,
        "description": "Great for outdoor activities and gifting."
    },
]

# ==========================================================
# PATH PARAMETER VALIDATION + QUERY PARAMETER VALIDATION
# ==========================================================
@app.get("/products/{product_id}")
async def get_product(
    # ----------------------------------
    # Path parameter validation
    # ----------------------------------
    product_id: Annotated[
        int,
        Path(
            ge=1,              # product_id must be >= 1
            le=3,              # product_id must be <= 3
            title="Product ID",
            description="Unique identifier of the product (1 to 3)"
        )
    ],

    # ----------------------------------
    # Optional query parameter validation
    # ----------------------------------
    search: Annotated[
        str | None,
        Query(
            max_length=20,
            title="Search keyword",
            description="Optional keyword to filter product by title"
        )
    ] = None
):
    """
    Fetch a single product by ID.
    Optionally filter by search keyword.
    """

    for product in PRODUCTS:
        if product["id"] == product_id:

            # If search is provided but does NOT match product title
            if search and search.lower() not in product["title"].lower():
                return {
                    "error": "Product does not match search keyword"
                }

            # Valid product found
            return product

    return {"error": "Product not found"}
