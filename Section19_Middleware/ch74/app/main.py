from fastapi import FastAPI
from app.middlewares import my_first_middleware,my_second_middleware


app = FastAPI()

#Middleware  follows botom to top approach 2nd first run and than 1st 
app.middleware("http")(my_first_middleware)
app.middleware("http")(my_second_middleware)



@app.get("/users")
async def get_users():
    print("End points Inside get users endpoint ")
    
    
@app.get("/post")
async def get_product():
    print("End points Inside get product end points")