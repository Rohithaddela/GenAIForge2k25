"""
Logging middleware — logs method, path, status code, and latency for every request.
"""
import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("cineforge.request")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        latency_ms = (time.perf_counter() - start) * 1000

        logger.info(
            "%s %s → %d  (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            latency_ms,
        )
        # Attach latency header for debugging
        response.headers["X-Response-Time"] = f"{latency_ms:.1f}ms"
        return response
