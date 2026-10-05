from app.account.models import User, RefreshToken
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status
from app.account.schemas import (
    UserCreate, 
    UserLogin, 
    PasswordChangeRequest,
    PasswordResetEmailRequest,
    PasswordResetRequest
)
from app.account.utils import (
    hash_password, 
    verify_password,
    create_email_verification_token,
    create_password_reset_token,
    verify_email_token_and_get_user_id
)

async def create_user(session: AsyncSession, user: UserCreate):
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
    return new_user 

async def authenticate_user(session: AsyncSession, user_login: UserLogin):
    stmt = select(User).where(User.email == user_login.email)
    result = await session.scalars(stmt)
    user = result.first()

    if not user or not verify_password(user_login.password, user.hashed_password):
        return None
    
    return user

async def email_verification_send(user: User):
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Your email is already verified. No need to send another verification email."
        )
    
    token = create_email_verification_token(user.id)
    link = f"http://localhost:8000/api/account/verify-email?token={token}"
    print(f"\n--- [VERIFICATION LINK] ---")
    print(f"Verify your email by clicking: {link}")
    print(f"---------------------------\n")
    
    return {"message": "Verification email sent successfully"}

async def verify_email_token(session: AsyncSession, token: str):
    user_id = verify_email_token_and_get_user_id(token, "verify_email")
    
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()

    if not user: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.is_verified:
        return {"message": "Email is already verified. You can log in directly."}

    user.is_verified = True
    session.add(user)
    await session.commit()
    return {"message": "Email verified successfully! You can now use your account."}

async def change_password(session: AsyncSession, user: User, data: PasswordChangeRequest):
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Old password is incorrect"
        )
    
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

async def password_reset_email_send(session: AsyncSession, data: PasswordResetEmailRequest):
    stmt = select(User).where(User.email == data.email)
    result = await session.scalars(stmt)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    token = create_password_reset_token(user.id)
    link = f"http://localhost:8000/api/account/verify-password-reset-token?token={token}"
    print(f"\n--- [PASSWORD RESET LINK] ---")
    print(f"Reset your password: {link}")
    print(f"-----------------------------\n")
    return {"message": "Password reset link sent"}

async def verify_password_reset_token(session: AsyncSession, data: PasswordResetRequest):
    user_id = verify_email_token_and_get_user_id(data.token, "password_reset")
    
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()

    if not user: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.hashed_password = hash_password(data.new_password)
    session.add(user)

    # Invalidate all active sessions upon password reset
    revoke_stmt = (
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )
    await session.execute(revoke_stmt)
    
    await session.commit()
    return {"message": "Password reset successful"}