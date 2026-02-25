from fastapi import FastAPI, Body
from typing import Annotated, List
from pydantic import BaseModel, Field
from datetime import datetime

app = FastAPI()

# ==========================================================
# PRODUCT MODEL WITH REAL-WORLD FIELDS
# ==========================================================
class Product(BaseModel):
    # Basic Info
    name: str = Field(
        ...,
        title="Product Name",
        description="The name of the product",
        min_length=1,
        max_length=100,
        pattern="^[A-Za-z0-9 ]+$"  # letters, numbers, spaces
    )

    description: str | None = Field(
        default=None,
        title="Product Description",
        description="Optional detailed description of the product",
        max_length=500
    )

    category: str = Field(
        ...,
        title="Category",
        description="Category of the product, e.g., Electronics, Clothing",
        min_length=1,
        max_length=50
    )

    price: float = Field(
        ...,
        gt=0,
        title="Product Price",
        description="Price in USD, must be greater than 0"
    )

    stock: int = Field(
        default=0,
        ge=0,
        title="Stock Quantity",
        description="Number of items in stock, must be non-negative"
    )

    tags: List[str] = Field(
        default_factory=list,
        title="Tags",
        description="Optional list of tags for filtering/searching products"
    )

    is_active: bool = Field(
        default=True,
        title="Is Active",
        description="Whether the product is active and available for purchase"
    )

    sku: str | None = Field(
        default=None,
        title="SKU",
        description="Stock Keeping Unit, unique identifier if available",
        max_length=50
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        title="Created At",
        description="Timestamp when the product was created"
    )

    updated_at: datetime | None = Field(
        default=None,
        title="Updated At",
        description="Timestamp when the product was last updated"
    )


# ==========================================================
# ENDPOINT TO CREATE PRODUCT
# ==========================================================
@app.post("/products")
async def create_product(product: Product):
    """
    Create a new product with validation.
    Returns the validated product data.
    """
    return product
