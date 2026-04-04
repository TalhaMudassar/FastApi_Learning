from fastapi import APIRouter

routers = APIRouter()

@routers.get("/products")
async def get_all_product():
    return {"data": "ALL product"}


@routers.get("/products/{product_id}")
async def get_single_product(product_id: int):
    return {"data": "Single product"}