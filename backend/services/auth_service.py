"""
Auth service — handles signup, login, token creation, and user lookup.
Uses bcrypt for password hashing and python-jose for JWT tokens.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from config import get_settings
from models.auth import TokenResponse, UserProfile
from services.db_service import find_user_by_email, find_user_by_id, create_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(user_id: str, email: str) -> dict:
    """Create access and refresh tokens."""
    now = datetime.now(timezone.utc)
    access_payload = {
        "sub": user_id,
        "email": email,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
        "iat": now,
        "type": "access",
    }
    refresh_payload = {
        "sub": user_id,
        "email": email,
        "exp": now + timedelta(days=30),
        "iat": now,
        "type": "refresh",
    }
    access_token = jwt.encode(access_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    refresh_token = jwt.encode(refresh_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return {"access_token": access_token, "refresh_token": refresh_token}


def signup(email: str, password: str, name: Optional[str] = None) -> TokenResponse:
    # Check if user already exists
    existing = find_user_by_email(email)
    if existing:
        raise ValueError("An account with this email already exists.")

    # Create user
    hashed = _hash_password(password)
    display_name = name or email.split("@")[0]
    user = create_user(email=email, hashed_password=hashed, name=display_name)

    # Generate tokens
    tokens = _create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        user_id=user["id"],
        email=user["email"],
        name=user.get("name"),
    )


def login(email: str, password: str) -> TokenResponse:
    user = find_user_by_email(email)
    if not user:
        raise ValueError("Invalid email or password.")

    if not _verify_password(password, user["password"]):
        raise ValueError("Invalid email or password.")

    tokens = _create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        user_id=user["id"],
        email=user["email"],
        name=user.get("name"),
    )


def logout(access_token: str) -> None:
    # Stateless JWT — nothing to invalidate server-side
    pass


def refresh(refresh_token: str) -> TokenResponse:
    try:
        payload = jwt.decode(refresh_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type.")
    except JWTError:
        raise ValueError("Invalid or expired refresh token.")

    user = find_user_by_id(payload["sub"])
    if not user:
        raise ValueError("User not found.")

    tokens = _create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        user_id=user["id"],
        email=user["email"],
        name=user.get("name"),
    )


def get_user(access_token: str) -> UserProfile:
    """Decode JWT and return user profile."""
    try:
        payload = jwt.decode(access_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "access":
            raise ValueError("Invalid token type.")
    except JWTError:
        raise ValueError("Invalid or expired token.")

    user = find_user_by_id(payload["sub"])
    if not user:
        raise ValueError("User not found.")

    return UserProfile(
        id=user["id"],
        email=user["email"],
        name=user.get("name"),
    )
