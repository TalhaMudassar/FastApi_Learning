from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

# ==========================================================
# 1) FIELD-LEVEL EXAMPLES (PER FIELD)
# ==========================================================
# - Each field has its own example
# - Shown in Swagger UI
# - Useful when you want examples per attribute

class ProductFieldExample(BaseModel):
    name: str = Field(
        examples=["Moto-E"]
    )
    price: float = Field(
        examples=[23.45]
    )
    stock: int | None = Field(
        default=None,
        examples=[43]
    )


@app.post("/products/field-example")
async def create_product_field_example(product: ProductFieldExample):
    return product


# ==========================================================
# 2) MODEL-LEVEL EXAMPLE (FULL JSON BODY EXAMPLE)
# ==========================================================
# - Define one or more complete examples for the whole model
# - Best for showing a realistic request body
# - Appears nicely in Swagger UI

class ProductModelExample(BaseModel):
    name: str
    price: float
    stock: int | None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Moto-E",
                    "price": 23.45,
                    "stock": 45
                },
                {
                    "name": "iPhone",
                    "price": 999.99,
                    "stock": 10
                }
            ]
        }
    }


@app.post("/products/model-example")
async def create_product_model_example(product: ProductModelExample):
    return product
