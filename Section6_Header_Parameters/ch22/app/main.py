from fastapi import FastAPI, Header
from typing import Annotated

app = FastAPI()

# ==========================================================
# 1) BASIC HEADER PARAMETER
# ==========================================================
# - Reads a value from request headers
# - If header is not present, value will be None (optional)
# - Example header: User-Agent: Mozilla/5.0

@app.get("/products/user-agent")
async def get_user_agent(
    user_agent: Annotated[str | None, Header()] = None
):
    return {
        "user_agent": user_agent
    }

# Test in CMD / Terminal:
# curl -H "User-Agent: Mozilla/5.0" http://127.0.0.1:8000/products/user-agent


# ==========================================================
# 2) HANDLING DUPLICATE HEADERS (LIST OF VALUES)
# ==========================================================
# - Some headers can appear multiple times
# - If you type it as list[str], FastAPI collects all values
# - Example header sent multiple times:
#   X-Product-Token: token1
#   X-Product-Token: token2

@app.get("/products")
async def get_products(
    x_product_token: Annotated[list[str] | None, Header()] = None
):
    return {
        "x_product_token": x_product_token or []
    }

# Test in CMD / Terminal:
# curl -H "X-Product-Token: token1" -H "X-Product-Token: token2" http://127.0.0.1:8000/products
