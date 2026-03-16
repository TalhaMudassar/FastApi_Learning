from fastapi import FastAPI, Request

app = FastAPI()

#Creating Middleware
@app.middleware("http")
async def my_first_middleware(request:Request, call_next):
    print("Middlware: Before Processing the request")
    print(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    print("Middlware: After Processing the request, before returning  response")
    print(f"Response status code: {response.status_code}")
    
    return response


@app.get("/users")
async def get_users():
    print("End points Inside get users endpoint ")
    
    
@app.get("/product")
async def get_product():
    print("Endpoint inside the get product end point")