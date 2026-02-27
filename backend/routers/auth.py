"""
Auth router — /auth/*
Routes:
  POST /auth/signup   — create account
  POST /auth/login    — email/password login
  POST /auth/logout   — invalidate session
  POST /auth/refresh  — swap refresh token
  GET  /auth/me       — current user info
"""
import logging
from fastapi import APIRouter, HTTPException, Request, status

from models.auth import SignupRequest, LoginRequest, RefreshRequest, TokenResponse, UserProfile
from services.auth_service import signup, login, logout, refresh, get_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup_route(body: SignupRequest):
    """Register a new user and return tokens."""
    try:
        return signup(email=body.email, password=body.password, name=body.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("Signup error: %s", exc)
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")


@router.post("/login", response_model=TokenResponse)
async def login_route(body: LoginRequest):
    """Authenticate with email + password, return access and refresh tokens."""
    try:
        return login(email=body.email, password=body.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except Exception as exc:
        logger.error("Login error: %s", exc)
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_route(request: Request):
    """Invalidate the current session."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""
    try:
        logout(token)
    except Exception:
        pass  # Best-effort logout


@router.post("/refresh", response_model=TokenResponse)
async def refresh_route(body: RefreshRequest):
    """Exchange a refresh token for a new access token."""
    try:
        return refresh(body.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except Exception as exc:
        logger.error("Refresh error: %s", exc)
        raise HTTPException(status_code=500, detail="Token refresh failed.")


@router.get("/me", response_model=UserProfile)
async def me_route(request: Request):
    """Return profile of the authenticated user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    token = auth_header[7:]
    try:
        return get_user(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
