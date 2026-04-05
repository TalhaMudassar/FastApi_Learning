from fastapi import FastAPI,Depends
from app.routers import routers, verify_token

app = FastAPI()

#Dependencies for a Group of Path Operator's 
app.include_router(routers)


# Method 2      Dependencies for a Group of Path Operator's 
# app.include_router(routers,dependencies=[Depends(verify_token)])
