from fastapi import FastAPI, Header, Depends
from typing import Annotated, List
from pydantic import BaseModel, Field

app = FastAPI()

# ==========================================================
# 1) PYDANTIC MODEL FOR HEADERS
# ==========================================================
# - This model represents all headers we care about
# - Helps with validation, structure, and documentation

class ProductHeaders(BaseModel):
    # Uncomment this to forbid unexpected headers in this model
    # model_config = {"extra": "forbid"}

    authorization: str
    accept_language: str | None = None
    x_tracking_id: List[str] = Field(default_factory=list)


# ==========================================================
# 2) DEPENDENCY FUNCTION TO READ HEADERS
# ==========================================================
# - Reads individual headers using Header()
# - Builds and returns a Pydantic model
# - FastAPI injects this wherever we use Depends(...)

async def get_product_headers(
    authorization: Annotated[str, Header()],
    accept_language: Annotated[str | None, Header()] = None,
    x_tracking_id: Annotated[List[str] | None, Header()] = None,
) -> ProductHeaders:
    return ProductHeaders(
        authorization=authorization,
        accept_language=accept_language,
        x_tracking_id=x_tracking_id or [],
    )


# ==========================================================
# 3) USE THE HEADERS MODEL IN ENDPOINT
# ==========================================================
# - headers is already a validated ProductHeaders object
# - Clean and structured access to header data

@app.get("/products")
async def get_products(
    headers: Annotated[ProductHeaders, Depends(get_product_headers)]
):
    return {
        "headers": headers
    }


# ==========================================================
# 4) TEST IN CMD / TERMINAL
# ==========================================================
# curl -H "Authorization: token1" \
#      -H "Accept-Language: en-US" \
#      -H "X-Tracking-Id: track1" \
#      -H "X-Tracking-Id: track2" \
#      http://127.0.0.1:8000/products






headers: Annotated[ProductHeaders, Depends(get_product_headers)]

