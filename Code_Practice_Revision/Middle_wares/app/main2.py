# 2. Execution Order & The Middleware Stack (Outer vs. Inner)
# Each middleware wraps the existing app like layers of an onion. 
# The last added middleware is the outermost layer, so on requests it executes first, and on responses it returns last.


from fastapi import FastAPI, Request

app = FastAPI(title="Middleware Execution Stack")

# Inner Middleware (Layer 1)
@app.middleware("http")
async def inner_middleware(request: Request, call_next):
    print("-> [1] Inner Middleware: Entering before endpoint")
    response = await call_next(request)
    print("<- [1] Inner Middleware: Exiting after endpoint")
    return response

# Outer Middleware (Layer 2) - Defined second, so it wraps Layer 1
@app.middleware("http")
async def outer_middleware(request: Request, call_next):
    print("-> [2] Outer Middleware: Entering first")
    response = await call_next(request)
    print("<- [2] Outer Middleware: Exiting last")
    return response

@app.get("/hello")
async def say_hello():
    print("   [*] Endpoint: Inside say_hello()")
    return {"message": "Hello World"}