from fastapi import FastAPI, Request

app = FastAPI()

#Creating Middleware
@app.middleware("http")
async def my_first_middleware(request:Request, call_next):
    print("1st Middlware: Before Processing the request")
    response = await call_next(request)
    print("1st Middlware: After Processing the request, before returning  response")
    return response


@app.middleware("http")
async def my_second_middleware(request:Request, call_next):
    print("2nd Middlware: Before Processing the request")
    response = await call_next(request)
    print("2nd Middlware: After Processing the request, before returning  response")
    return response


@app.get("/users")
async def get_users():
    print("End points Inside get users endpoint ")
    