from fastapi import FastAPI
from app.middlewares import user_only_middleware,product_only_middleware,My_Middleware

app = FastAPI()

app.middleware("http")(user_only_middleware)
app.middleware("http")(product_only_middleware)
app.middleware("http")(My_Middleware)



@app.get("/users")
async def get_users():
    print("End points Inside get users endpoint ")
    
    
@app.get("/products")
async def get_product():
    print("End points Inside get product end points")