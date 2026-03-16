from fastapi import Request


#First Middlware
async def my_first_middleware(request:Request,call_next):
    print("1st Middlware Before processing the request")
    
    response = await call_next(request)
    
    print("1st Middlware After processing the request")
    return response



#Second Middleware 
async def my_second_middleware(request:Request, call_next):
    print("2st Middlware Before processing the request")
    
    response = await call_next(request)
    
    print("2st Middlware After processing the request")
    return response