from fastapi import FastAPI, Query
from typing import Annotated
from pydantic import AfterValidator
app = FastAPI()

# =====================================
# IN-MEMORY DATA
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
    }
]


# # =====================================
# # BASIC QUERY PARAMETER (OPTIONAL)
# # =====================================
# # If search is not passed → return all products
# # If search is passed → filter products by title

@app.get("/products")
async def get_products(search: str | None = None):
    if search:
        search_lower = search.lower()
        return [
            product for product in PRODUCTS
            if search_lower in product["title"].lower()
        ]
    return PRODUCTS


# # =====================================
# # QUERY VALIDATION (OLD STYLE)
# # =====================================
# # Using Query() directly in parameter default

@app.get("/products")
async def get_products(
    search: str | None = Query(default=None, max_length=5)
):
    """
    search:
    - optional
    - maximum length = 5
    """
    if search:
        search_lower = search.lower()
        return [
            product for product in PRODUCTS
            if search_lower in product["title"].lower()
        ]
    return PRODUCTS


# # =====================================
# # QUERY VALIDATION WITH Annotated (MODERN)
# # =====================================
# # Recommended approach in real projects

@app.get("/products")
async def get_products(
    search: Annotated[
        str | None,
        Query(min_length=5, max_length=7)
    ] = None
):
    if search:
        search_lower = search.lower()
        return [
            product for product in PRODUCTS
            if search_lower in product["title"].lower()
        ]
    return PRODUCTS


# # =====================================
# # REQUIRED QUERY PARAMETER
# # =====================================
# # search is REQUIRED because:
# # - No default value
# # - No None allowed

@app.get("/products")
async def get_products(
    search: Annotated[str, Query(min_length=5)]
):
    search_lower = search.lower()
    return [
        product for product in PRODUCTS
        if search_lower in product["title"].lower()
    ]


# # =====================================
# # QUERY VALIDATION WITH REGEX (PATTERN)
# # =====================================
# # Accepts ONLY lowercase letters (a-z)

@app.get("/products")
async def get_products(
    search: Annotated[
        str | None,
        Query(pattern="^[a-z]+$")
    ] = None
):
    """
    Regex Pattern:
    - ^[a-z]+$
    - Only lowercase letters allowed
    """
    if search:
        search_lower = search.lower()
        return [
            product for product in PRODUCTS
            if search_lower in product["title"].lower()
        ]
    return PRODUCTS


# ==========================================================
#  MULTIPLE QUERY VALUES (LIST QUERY PARAMETERS)
# ==========================================================
# Example URL:
# /products?search=bag&search=shirt
#
# FastAPI automatically converts repeated query params
# into a Python list when using list[str]

@app.get("/products/multiple")
async def get_products_multiple(
    search: Annotated[list[str] | None, Query()] = None
):
    """
    search can be passed multiple times:
    ?search=value1&search=value2
    """
    if search:
        filtered = []
        for product in PRODUCTS:
            for s in search:
                if s.lower() in product["title"].lower():
                    filtered.append(product)
        return filtered

    return PRODUCTS


# ==========================================================
#  ALIAS (RENAME QUERY PARAMETER)
# ==========================================================
# Example URL:
# /products/alias?q=bag&q=shirt
#
# 'q' is used in URL
# 'search' is used in Python code

@app.get("/products/alias")
async def get_products_alias(
    search: Annotated[list[str] | None, Query(alias="q")] = None
):
    """
    Alias allows shorter or backward-compatible query names
    """
    if search:
        return [
            product
            for product in PRODUCTS
            for s in search
            if s.lower() in product["title"].lower()
        ]

    return PRODUCTS


# ==========================================================
#  METADATA (SWAGGER / OPENAPI DOCUMENTATION)
# ==========================================================
# Metadata appears automatically in /docs

@app.get("/products/metadata")
async def get_products_metadata(
    search: Annotated[
        list[str] | None,
        Query(
            alias="q",
            title="Search Products",
            description="Search products by title keywords"
        )
    ] = None
):
    """
    Metadata improves API documentation
    """
    if search:
        return [
            product
            for product in PRODUCTS
            for s in search
            if s.lower() in product["title"].lower()
        ]

    return PRODUCTS


# ==========================================================
#  DEPRECATED QUERY PARAMETER
# ==========================================================
# Used when migrating APIs
# Still works but marked deprecated in Swagger UI

@app.get("/products/deprecated")
async def get_products_deprecated(
    search: Annotated[list[str] | None, Query(deprecated=True)] = None
):
    """
    This parameter is deprecated but still usable
    """
    if search:
        return [
            product
            for product in PRODUCTS
            for s in search
            if s.lower() in product["title"].lower()
        ]

    return PRODUCTS


# ==========================================================
#  CUSTOM VALIDATION WITH AfterValidator (ADVANCED 🔥)
# ==========================================================
# Custom validation logic using Pydantic v2

def check_valid_id(id: str):
    """
    Custom rule:
    Product ID must start with 'prod-'
    """
    if not id.startswith("prod-"):
        raise ValueError("ID must start with 'prod-'")
    return id


@app.get("/products/validate-id")
async def get_products_validate_id(
    id: Annotated[
        str | None,
        AfterValidator(check_valid_id)
    ] = None
):
    """
    Valid:
    /products/validate-id?id=prod-1
    /products/validate-id?id=prod-100

    Invalid:
    /products/validate-id?id=123
    """
    if id:
        return {
            "id": id,
            "message": "Valid product ID"
        }

    return {
        "message": "No ID provided"
    }