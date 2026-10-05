from fastapi import Depends, HTTPException, status, Request
from sqlalchemy import select
from app.db.config import SessionDep
from app.account.models import User
from app.account.utils import decode_token

async def get_current_user(session: SessionDep, request: Request):
  token = request.cookies.get("access_token")
  if not token:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
  payload = decode_token(token)
  if not payload:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
  user_id = payload.get("sub")
  if not user_id:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
  stmt = select(User).where(User.id == int(user_id))
  result = await session.scalars(stmt)
  user = result.first()
  if not user:
    raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
  return user

async def require_admin(user: User = Depends(get_current_user)):
  if not user.is_admin:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
  return user
  