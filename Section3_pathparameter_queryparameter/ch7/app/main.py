from fastapi import FastAPI

app = FastAPI()

# ================================
# HARD-CODED (STATIC) ROUTE
# ================================
# This route has a FIXED URL
# It must be written BEFORE dynamic routes

@app.get("/product/rode_nt_usb")
async def get_rode_microphone():
    return {
        "response": "Single data fetched (hard-coded product)"
    }


# ================================
# DYNAMIC ROUTE (PATH PARAMETER)
# ================================
# This route accepts ANY string value
# Example: /product/iphone, /product/samsung

@app.get("/product/{product_title}")
async def single_product(product_title: str):
    return {
        "response": "Single data fetched (dynamic route)",
        "product_title": product_title
    }
