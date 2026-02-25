from fastapi import FastAPI

app = FastAPI()

# =====================================
# SINGLE QUERY PARAMETER
# =====================================
# Example URL:
# /product?category=clothes

@app.get("/product")
async def product(category: str):
    return { "response": "OK", "category": category
    }


# =====================================
# MULTIPLE QUERY PARAMETERS
# =====================================
# Example URL:
# /product?category=clothes&limit=4

@app.get("/product")
async def products(category: str, limit: int):
    return { "status": "ok", "category": category,"limit": limit
    }


# =====================================
# DEFAULT QUERY PARAMETER
# =====================================
# limit has a default value
# If not passed → FastAPI uses default

@app.get("/product")
async def products(category: str, limit: int = 10):
    return {"status": "ok", "category": category, "limit": limit}

# /product?category=clothes        → limit = 10
# /product?category=clothes&limit=20 → limit = 20


# =====================================
# OPTIONAL QUERY PARAMETER
# =====================================
# category is optional
# limit is REQUIRED (no default value)

@app.get("/product")
async def products(limit: int, category: str | None = None):
    """
    Query Parameters:
    - limit (required)
    - category (optional)
    """
    return { "status": "ok","category": category, "limit": limit}

# Valid URLs:
# /product?limit=5
# /product?limit=5&category=books

# Invalid URLs:
# /product               ❌ limit missing
# /product?category=books ❌ limit missing


# =====================================
# PATH + QUERY PARAMETERS TOGETHER
# =====================================
@app.get("/product/{year}")
async def product(year: str, category: str):
    """
    Path Parameter:
    - year

    Query Parameter:
    - category
    """
    return { "status": "ok", "year": year,  "category": category}

# Example URL:
# /product/2025?category=clothes
