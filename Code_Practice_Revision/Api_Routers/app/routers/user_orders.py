from fastapi import APIRouter


# Sub-router without a prefix (the prefix will be inherited/mounted)
orders_router = APIRouter(
    prefix="/orders",
    tags=["User Orders"]
)

@orders_router.get("/")
async def get_user_orders(user_id: int):
    # Notice user_id is inherited from the parent router's path!
    return {"user_id": user_id, "orders": ["order_101", "order_102"]}

