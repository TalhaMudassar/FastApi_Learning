from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from decouple import config

from app.account.routers import router as account_router
from app.product.routers.category import router as category_router
from app.product.routers.product import router as product_router
from app.cart.routers import router as cart_router
from app.shipping.routers import router as shipping_router
from app.order.routers import router as order_router
from app.payment.routers import router as payment_router

app = FastAPI(title="FASTAPI E-Commerce Backend")

# 1. Enable CORS for Next.js frontend
frontend_url = config("FRONTEND_URL", default="http://localhost:3000")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Mount static directory to serve uploaded product images
# Ensure the folder "media" exists at the root of your FastAPI project
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.get("/")
def root():
    return {"message": "Welcome to the Ecommerce Website"}

# 3. Include API Routers
app.include_router(account_router, prefix="/api/account", tags=["Account"])
app.include_router(category_router, prefix="/api/products-category", tags=["Product Categories"])
app.include_router(product_router, prefix="/api/products", tags=["Products"])
app.include_router(cart_router, prefix="/api/carts", tags=["Carts"])
app.include_router(shipping_router, prefix="/api/shippings", tags=["Shippings"])
app.include_router(order_router, prefix="/api/orders", tags=["Orders"])
app.include_router(payment_router, prefix="/api/payments", tags=["Payments"])