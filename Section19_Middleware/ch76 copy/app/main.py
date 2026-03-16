from fastapi import FastAPI
#buildin middleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

#custom middleware
from app.middlewares import user_only_middleware,product_only_middleware,My_Middleware

app = FastAPI()


#Adding buildin middleware
# app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)


#Adding custom middleware
app.middleware("http")(user_only_middleware)
app.middleware("http")(product_only_middleware)
app.middleware("http")(My_Middleware)



@app.get("/users")
async def get_users():
    print("End points Inside get users endpoint ")
    return {"Data": "All users data"}
    
    
@app.get("/products")
async def get_product():
    print("End points Inside get product end points")
    return {"Data": "All products data"}