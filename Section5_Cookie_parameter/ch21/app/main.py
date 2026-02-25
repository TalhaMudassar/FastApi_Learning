from fastapi import FastAPI, Cookie, Body, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel, Field

app = FastAPI()


# -----------------------------
# 1) Pydantic model for cookies
# -----------------------------
class ProductCookie(BaseModel):
    model_config = {"extra": "forbid"}  # Security: forbid unknown fields

    Session_id: str = Field(title="Session ID", description="User session identifier")
    preferred_Category: str | None = Field(
        default=None, title="Preferred Category", description="User preferred category"
    )
    Tracking_id: str | None = Field(
        default=None, title="Tracking ID", description="Tracking identifier"
    )


# ----------------------------------------
# 2) Dependency to read cookies and validate
# ----------------------------------------
async def get_product_cookie(
    Session_id: Annotated[str | None, Cookie()] = None,
    preferred_Category: Annotated[str | None, Cookie()] = None,
    Tracking_id: Annotated[str | None, Cookie()] = None,
) -> ProductCookie:
    if Session_id is None:
        # Required cookie missing → return proper HTTP error
        raise HTTPException(status_code=422, detail="Session_id cookie is required")

    return ProductCookie(
        Session_id=Session_id,
        preferred_Category=preferred_Category,
        Tracking_id=Tracking_id,
    )


# -----------------------------
# 3) GET endpoint (cookies only)
# -----------------------------
@app.get("/products/recommendations")
async def get_recommendations(
    cookie: Annotated[ProductCookie, Depends(get_product_cookie)]
):
    response = {"session_id": cookie.Session_id}

    if cookie.preferred_Category:
        response["message"] = f"Recommendation for {cookie.preferred_Category}"
    else:
        response["message"] = f"Default Recommendation for session {cookie.Session_id}"

    if cookie.Tracking_id:
        response["Tracking_id"] = cookie.Tracking_id

    return response


# -----------------------------
# 4) Body model for price filter
# -----------------------------
class PriceFilter(BaseModel):
    min_price: float = Field(ge=0, title="Minimum Price", description="Minimum price")
    max_price: float | None = Field(
        default=None, title="Maximum Price", description="Maximum price"
    )


# ------------------------------------
# 5) POST endpoint (cookies + body)
# ------------------------------------
@app.post("/products/recommendations")
async def get_recommendations_with_filter(
    cookie: Annotated[ProductCookie, Depends(get_product_cookie)],
    price_filter: Annotated[PriceFilter, Body(embed=True)],
):
    response = {
        "session_id": cookie.Session_id,
        "price_range": {
            "min_range": price_filter.min_price,
            "max_range": price_filter.max_price,
        },
    }

    if cookie.preferred_Category:
        response["category"] = cookie.preferred_Category

    response["message"] = (
        f"Recommendation for session {cookie.Session_id} "
        f"with price range {price_filter.min_price} to {price_filter.max_price or 'unlimited'}"
    )

    return response












