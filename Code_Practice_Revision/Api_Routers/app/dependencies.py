from fastapi import Header, HTTPException, status

async def verify_token(x_token: str = Header(...)):
    if x_token != "supersecret-token":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="X-Token header invalid"
        )

async def verify_key(x_key: str = Header(...)):
    if x_key != "fake-super-secret-key":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="X-Key header invalid"
        )