from fastapi import APIRouter, Depends, Request
from app.account.services import create_user, authenticate_user
from app.account.models import UserCreate, UserOut
from app.db.config import SessionDep
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException
from app.account.utils import create_tokens, verify_refresh_token
from fastapi.responses import JSONResponse
from app.account.dependencies import get_current_user


router = APIRouter(prefix="/account" , tags=["Account"])

@router.post("/register", response_model=UserOut)
def register(session:SessionDep, user:UserCreate):
    return create_user(session,user)


@router.post("/login")
def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
  user = authenticate_user(session, form_data.username, form_data.password)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid credentials")
  tokens = create_tokens(session, user)
  response = JSONResponse(content={"access_token": tokens["access_token"]})
  response.set_cookie("refresh_token", tokens["refresh_token"], httponly=True, secure=True, samesite="Lax", max_age=60 * 60 * 24 * 7)
  return response



@router.post("/refresh")
def refresh_token(session: SessionDep, request: Request):
  token = request.cookies.get("refresh_token")
  if not token:
    raise HTTPException(status_code=401, detail="Missing refresh token")
  user = verify_refresh_token(session, token)
  if not user:
    raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
  return create_tokens(session, user)
 
@router.get("/me", response_model=UserOut)
def me(user = Depends(get_current_user)):
  return user