from fastapi import APIRouter

routers = APIRouter(prefix="/products")

    
@routers.get("/", tags=["newproduct"])
async def get_all_product():
    return {"data": "ALL product"}


@routers.get("/{product_id}", tags=["newproduct"])
async def get_single_product(product_id: int):
    return {"data": "Single product"}