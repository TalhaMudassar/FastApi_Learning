from decouple import config
from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.account.models import RefreshToken, User
from app.account.schemas import (
    PasswordChangeRequest,
    PasswordResetEmailRequest,
    PasswordResetRequest,
    UserCreate,
    UserLogin,
)
from app.account.utils import (
    create_email_verification_token,
    create_password_reset_token,
    get_user_by_email,
    hash_password,
    send_email,
    verify_email_token_and_get_user_id,
    verify_password,
)

FRONTEND_URL = config("FRONTEND_URL")


# Create user and send email verification to user's inbox
async def create_user(session: AsyncSession, user: UserCreate, background_tasks: BackgroundTasks):
    stmt = select(User).where(User.email == user.email)
    result = await session.scalars(stmt)
    if result.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    # Send verification link to registered email
    await email_verification_send(new_user, background_tasks)

    return new_user


async def authenticate_user(session: AsyncSession, user_login: UserLogin):
    stmt = select(User).where(User.email == user_login.email)
    result = await session.scalars(stmt)
    user = result.first()

    if not user or not verify_password(user_login.password, user.hashed_password):
        return None

    return user


async def email_verification_send(user: User, background_tasks: BackgroundTasks):
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your email is already verified. No need to send another verification email."
        )

    token = create_email_verification_token(user.id)
    # Generates the exact link consumed by the Next.js page
    link = f"{FRONTEND_URL}/user/verify-email?token={token}"
    subject = "Verify Your Email"
    body = f"Hi {user.email},\n\nPlease verify your email by clicking this link:\n{link}\n\nThank you!"

    background_tasks.add_task(send_email, subject, [user.email], body)
    return {"msg": "Verification email sent"}


async def verify_email_token(session: AsyncSession, token: str):
    user_id = verify_email_token_and_get_user_id(token, "verify_email")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_verified:
        return {"msg": "Email is already verified. You can log in directly."}

    user.is_verified = True
    session.add(user)
    await session.commit()
    return {"msg": "Email verified successfully"}


async def change_password(session: AsyncSession, user: User, data: PasswordChangeRequest):
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Old password is incorrect")

    if data.old_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as old password"
        )

    user.hashed_password = hash_password(data.new_password)
    session.add(user)

    revoke_stmt = (
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )
    await session.execute(revoke_stmt)
    await session.commit()
    return {"msg": "Password changed successfully"}


# Generate password reset token and send reset link to user email
async def password_reset_email_send(session: AsyncSession, data: PasswordResetEmailRequest, background_tasks: BackgroundTasks):
    user = await get_user_by_email(session, data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    token = create_password_reset_token(user.id)
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    subject = "Reset Your Password"
    body = f"Hi {user.email},\n\nPlease reset your password by clicking this link:\n{link}\n\nThank you!"

    background_tasks.add_task(send_email, subject, [user.email], body)
    return {"msg": "Password reset link sent", "detail": "Password reset link sent! Check your email."}


# Verify reset token, update password, and revoke previous sessions
async def verify_password_reset_token(session: AsyncSession, data: PasswordResetRequest):
    user_id = verify_email_token_and_get_user_id(data.token, "password_reset")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(data.new_password)
    session.add(user)

    revoke_stmt = (
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )
    await session.execute(revoke_stmt)
    await session.commit()
    return {"msg": "Password reset successful", "detail": "Password reset successful! Redirecting to login..."}