from fastapi import FastAPI
from user.routers import router as user_routers
from product.routers import routers as product_routers
app = FastAPI()


app.include_router(user_routers, prefix="/users")

app.include_router(product_routers)


