from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.account.deps import get_current_user, require_admin
from app.account.models import User
from app.account.schemas import (
    PasswordChangeRequest,
    PasswordResetEmailRequest,
    PasswordResetRequest,
    UserCreate,
    UserLogin,
    UserOut,
)
from app.account.services import (
    authenticate_user,
    change_password,
    create_user,
    email_verification_send,
    password_reset_email_send,
    verify_email_token,
    verify_password_reset_token,
)
from app.account.utils import (
    JWT_ACCESS_TOKEN_TIME_MIN,
    JWT_REFRESH_TOKEN_TIME_DAY,
    create_tokens,
    revoke_refresh_token,
    verify_and_revoke_refresh_token,
)
from app.db.config import SessionDep

router = APIRouter()


# Register new user and trigger email verification
@router.post("/register", response_model=UserOut)
async def register(session: SessionDep, user: UserCreate, background_tasks: BackgroundTasks):
    return await create_user(session, user, background_tasks)


@router.post("/login")
async def login(session: SessionDep, user_login: UserLogin):
    user = await authenticate_user(session, user_login)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    tokens = await create_tokens(session, user)
    response = JSONResponse(content={"message": "Login successful"})

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=JWT_ACCESS_TOKEN_TIME_MIN * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=JWT_REFRESH_TOKEN_TIME_DAY * 86400
    )

    return response


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/refresh")
async def refresh_token(session: SessionDep, request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )

    user = await verify_and_revoke_refresh_token(session, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    tokens = await create_tokens(session, user)
    response = JSONResponse(content={"message": "Token refreshed successfully"})

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=JWT_ACCESS_TOKEN_TIME_MIN * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=JWT_REFRESH_TOKEN_TIME_DAY * 86400
    )
    return response


@router.post("/send-verification-email")
async def send_verification_email(
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user)
):
    return await email_verification_send(user, background_tasks)


# Handles GET /api/account/verify-email?token=... called by Next.js
@router.get("/verify-email")
async def verify_email(session: SessionDep, token: str):
    return await verify_email_token(session, token)


# Change authenticated user password
@router.post("/change-password")
async def password_change(
    session: SessionDep,
    data: PasswordChangeRequest,
    user: User = Depends(get_current_user)
):
    await change_password(session, user, data)
    return {"msg": "Password changed successfully", "message": "Password changed successfully"}


# Send password reset email with temporary token
@router.post("/send-password-reset-email")
async def send_password_reset_email(
    session: SessionDep,
    data: PasswordResetEmailRequest,
    background_tasks: BackgroundTasks
):
    return await password_reset_email_send(session, data, background_tasks)


# Verify password reset token and update user password
@router.post("/verify-password-reset-token")
async def verify_password_reset_email(session: SessionDep, data: PasswordResetRequest):
    return await verify_password_reset_token(session, data)


@router.get("/admin")
async def admin(user: User = Depends(require_admin)):
    return {"message": f"Welcome Admin {user.email}"}


@router.post("/logout")
async def logout(session: SessionDep, request: Request):
    refresh_token_cookie = request.cookies.get("refresh_token")
    if refresh_token_cookie:
        await revoke_refresh_token(session, refresh_token_cookie)

    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    response.delete_cookie(key="refresh_token", httponly=True, samesite="lax")
    return response