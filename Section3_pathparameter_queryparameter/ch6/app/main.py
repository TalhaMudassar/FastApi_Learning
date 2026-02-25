from fastapi import FastAPI

# Create FastAPI app instance
app = FastAPI()


# =====================================
# PATH PARAMETER WITHOUT TYPE
# =====================================
# By default, FastAPI treats path parameters as STRING
# even if the value looks like a number

@app.get("/product/{product_id}")
async def single_product(product_id):
    return {
        "response": "Single data fetched",
        "product_id": product_id
    }


# =====================================
# PATH PARAMETER WITH INTEGER TYPE
# =====================================
# FastAPI automatically converts product_id to int
# and validates the input

@app.get("/product/{product_id}")
async def single_product(product_id: int):
    return {
        "response": "Single data fetched",
        "product_id": product_id
    }


# =====================================
# PATH PARAMETER WITH STRING TYPE
# =====================================
# This endpoint expects a STRING value in the URL

@app.get("/product/{product_title}")
async def single_product(product_title: str):
    """
    product_title is a path parameter of type string
    Example URL: /product/iphone
    """
    return {
        "response": "Single data fetched",
        "product_title": product_title
    }
