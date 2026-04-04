from fastapi import APIRouter

routers = APIRouter(tags=["products"])

@routers.get("/products", tags=["newproduct"])
async def get_all_product():
    return {"data": "ALL product"}


@routers.get("/products/{product_id}", tags=["newproduct"])
async def get_single_product(product_id: int):
    return {"data": "Single product"}