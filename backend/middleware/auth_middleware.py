"""
Auth middleware — validates Bearer JWT on every protected route.
Attaches user info to request.state.user.
Skips: /auth/*, /health, /docs, /openapi.json, /redoc
"""
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from services.auth_service import get_user

logger = logging.getLogger(__name__)

SKIP_PREFIXES = ("/auth", "/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico")


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Always allow preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip public routes
        if any(request.url.path.startswith(p) for p in SKIP_PREFIXES):
            return await call_next(request)

        # Extract Bearer token
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header. Use: Bearer <token>"},
            )

        token = auth_header[7:]
        try:
            user = get_user(token)
            request.state.user = user
        except Exception as exc:
            logger.warning("Auth failed for %s: %s", request.url.path, exc)
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token."})

        return await call_next(request)
