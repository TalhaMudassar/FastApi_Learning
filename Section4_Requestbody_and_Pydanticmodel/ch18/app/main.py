from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

app = FastAPI()

# ==========================================================
# 1) SUB MODEL (NESTED MODEL)
# ==========================================================
class Category(BaseModel):
    name: str = Field(
        ...,
        title="Category Name",
        description="The name of the product category",
        min_length=1,
        max_length=50
    )
    description: str | None = Field(
        default=None,
        title="Category Description",
        description="A brief description of the category",
        max_length=200
    )


# ==========================================================
# 2) MAIN MODEL USING SINGLE SUB MODEL
# ==========================================================
class Product(BaseModel):
    name: str = Field(
        ...,
        title="Product Name",
        description="The name of the product",
        min_length=1,
        max_length=100
    )
    price: float = Field(
        ...,
        gt=0,
        title="Product Price",
        description="The price in USD, must be greater than 0"
    )
    stock: int | None = Field(
        default=None,
        ge=0,
        title="Stock Quantity",
        description="Number of items in stock, must be non-negative"
    )
    category: Category | None = Field(
        default=None,
        title="Product Category",
        description="The category to which the product belongs"
    )


@app.post("/product")
async def create_product(product: Product):
    return product


# ==========================================================
# 3) MODEL WITH LIST OF SUB MODELS
# ==========================================================
# Example: A product can belong to multiple categories

class ProductWithCategories(BaseModel):
    name: str = Field(
        ...,
        title="Product Name",
        description="The name of the product",
        min_length=1,
        max_length=100
    )
    price: float = Field(
        ...,
        gt=0,
        title="Product Price",
        description="The price in USD, must be greater than 0"
    )
    stock: int | None = Field(
        default=None,
        ge=0,
        title="Stock Quantity",
        description="Number of items in stock, must be non-negative"
    )
    categories: List[Category] | None = Field(
        default=None,
        title="Product Categories",
        description="List of categories this product belongs to"
    )


@app.post("/product/multiple-categories")
async def create_product_with_categories(product: ProductWithCategories):
    return product
