from fastapi import FastAPI, Depends, Body, Cookie, HTTPException, Header
from typing import Annotated
from pydantic import BaseModel, Field

app = FastAPI()


# -----------------------------
# Product Cookie Model
# -----------------------------
class ProductionCookie(BaseModel):
    model_config = {"extra": "forbid"}

    session_id: str = Field(title="Session ID", description="User session identifier")
    preferred_category: str | None = Field(
        default=None, title="Preferred Category", description="User preferred category"
    )
    tracking_id: str | None = Field(
        default=None, title="Tracking ID", description="Tracking identifier"
    )


# -----------------------------
# Cookie Dependency
# -----------------------------
async def get_product_cookie(
    session_id: Annotated[str | None, Cookie()] = None,
    preferred_category: Annotated[str | None, Cookie()] = None,
    tracking_id: Annotated[str | None, Cookie()] = None,
) -> ProductionCookie:
    if session_id is None:
        raise HTTPException(status_code=422, detail="session_id cookie is required")

    return ProductionCookie(
        session_id=session_id,
        preferred_category=preferred_category,
        tracking_id=tracking_id,
    )


# -----------------------------
# Product Header Model
# -----------------------------
class ProductHeaders(BaseModel):
    model_config = {"extra": "forbid"}

    authorization: str
    accept_language: str | None = None
    x_tracking_id: list[str] = Field(default_factory=list)


# -----------------------------
# Header Dependency
# -----------------------------
async def get_product_headers(
    authorization: Annotated[str, Header()],
    accept_language: Annotated[str | None, Header()] = None,
    x_tracking_id: Annotated[list[str] | None, Header()] = None,
) -> ProductHeaders:
    return ProductHeaders(
        authorization=authorization,
        accept_language=accept_language,
        x_tracking_id=x_tracking_id or [],
    )


# -----------------------------
# Body Model
# -----------------------------
class PriceFilter(BaseModel):
    min_price: float = Field(ge=0, title="Minimum Price", description="Minimum price")
    max_price: float | None = Field(
        default=None, title="Maximum Price", description="Maximum price"
    )


# -----------------------------
# Endpoint using Cookie + Header + Body
# -----------------------------
@app.post("/product")
async def create_product(
    cookies: Annotated[ProductionCookie, Depends(get_product_cookie)],
    headers: Annotated[ProductHeaders, Depends(get_product_headers)],
    pricefilter: Annotated[PriceFilter, Body(embed=True)],
):
    return {
        "headers": headers,
        "cookies": cookies,
        "pricefilter": pricefilter,
    }
    
    
###Testing in cmd /Terminal
# curl -X POST ^
#   -H "Content-Type: application/json" ^
#   -H "Authorization: token123" ^
#   -H "Cookie: session_id=abc123" ^
#   -d "{\"pricefilter\": {\"min_price\": 50}}" ^
#   http://127.0.0.1:8000/product

