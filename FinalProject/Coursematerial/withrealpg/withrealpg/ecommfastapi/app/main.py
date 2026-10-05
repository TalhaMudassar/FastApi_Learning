from fastapi import FastAPI
from app.account.routers import router as account_router
from app.product.routers.category import router as category_router
from app.product.routers.product import router as product_router
from app.cart.routers import router as cart_router
from app.shipping.routers import router as shipping_router
from app.order.routers import router as order_router
from app.payment.routers import router as payment_router
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="FastAPI E-Commerce Backend")

app.mount("/media", StaticFiles(directory="media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the E-Commerce API"}

app.include_router(account_router, prefix="/api/account", tags=["Account"])
app.include_router(product_router, prefix="/api/products", tags=["Products"])
app.include_router(category_router, prefix="/api/products-category", tags=["Product Categories"])
app.include_router(cart_router, prefix="/api/carts", tags=["Carts"])
app.include_router(shipping_router, prefix="/api/shippings", tags=["Shippings"])
app.include_router(order_router, prefix="/api/orders", tags=["Orders"])
app.include_router(payment_router, prefix="/api/payments", tags=["Payments"])
