from datetime import datetime, timedelta, timezone
import uuid
from decouple import config
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.account.models import RefreshToken, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY = config("JWT_SECRET_KEY") 
JWT_ALGORITHM = config("JWT_ALGORITHM") 
JWT_ACCESS_TOKEN_TIME_MIN = config("JWT_ACCESS_TOKEN_TIME_MIN", cast=int) 
JWT_REFRESH_TOKEN_TIME_DAY = config("JWT_REFRESH_TOKEN_TIME_DAY", cast=int) 
EMAIL_VERIFICATION_TOKEN_TIME_HOUR = config("EMAIL_VERIFICATION_TOKEN_TIME_HOUR", cast=int) 
EMAIL_PASSWORD_RESET_TOKEN_TIME_HOUR = config("EMAIL_PASSWORD_RESET_TOKEN_TIME_HOUR", cast=int) 

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_ACCESS_TOKEN_TIME_MIN))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def create_tokens(session: AsyncSession, user: User) -> dict:
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token_str = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_TOKEN_TIME_DAY)

    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=expires_at
    )
    session.add(refresh_token)
    await session.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def verify_and_revoke_refresh_token(session: AsyncSession, token: str):
    stmt = select(RefreshToken).where(RefreshToken.token == token)
    result = await session.scalars(stmt)
    db_refresh_token = result.first()

    if db_refresh_token and not db_refresh_token.revoked:
        expires_at = db_refresh_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if expires_at > datetime.now(timezone.utc):
            db_refresh_token.revoked = True
            await session.commit()

            user_stmt = select(User).where(User.id == db_refresh_token.user_id)
            user_result = await session.scalars(user_stmt)
            return user_result.first()
        
    return None

def create_email_verification_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=EMAIL_VERIFICATION_TOKEN_TIME_HOUR)
    to_encode = {"sub": str(user_id), "type": "verify_email", "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_password_reset_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=EMAIL_PASSWORD_RESET_TOKEN_TIME_HOUR)
    to_encode = {"sub": str(user_id), "type": "password_reset", "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_email_token_and_get_user_id(token: str, token_type: str) -> int:
    payload = decode_token(token)
    if payload.get("type") != token_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid token type"
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid token subject"
        )
    return int(user_id)


async def revoke_refresh_token(session: AsyncSession, token: str):
    stmt = select(RefreshToken).where(RefreshToken.token == token)
    result = await session.scalars(stmt)
    db_refresh_token = result.first()

    if db_refresh_token:
        db_refresh_token.revoked = True
        await session.commit()