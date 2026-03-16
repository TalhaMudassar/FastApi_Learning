from fastapi import Request


#User  path specific  Middlware
async def user_only_middleware(request:Request,call_next):
    if request.url.path.startswith("/users"):
        print("User Middleware: Before Processing the Request")
        response = await call_next(request)
        print("User Middleware: After Processing the Request , Before Returning the response")
        return response
    else:
        print(f"User Middlware : Skipping middleware for {request.url.path}")
        response = await call_next(request)
        return response



#Product path specific  Middlware
async def product_only_middleware(request:Request, call_next):
    if request.url.path.startswith("/products"):
        print("Product Middleware: Before Processing the Request")
        response = await call_next(request)
        print("Product Middleware: After Processing the Request, Before Returning the response")
        return response
    else:
        print(f"Product Middlware : Skipping middleware for {request.url.path}")
        response = await call_next(request)
        return response
    
    

#My Middlware
async def My_Middleware(request:Request, call_next):
    print("My Middleware: Before Processing the Request")
    response = await call_next(request)
    print("My Middleware: After Processing the Request, Before Returning the response")
    return response