"""
Sliding-window rate limiter — in-memory, per client IP.
Returns 429 Too Many Requests when a client exceeds RATE_LIMIT_PER_MINUTE.
"""
import time
from collections import defaultdict, deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from config import get_settings

settings = get_settings()

# ip → deque of timestamps (seconds)
_windows: dict[str, deque] = defaultdict(deque)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int | None = None):
        super().__init__(app)
        self.limit = limit or settings.rate_limit_per_minute
        self.window = 60  # seconds

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        q = _windows[ip]

        # Evict timestamps older than the window
        while q and q[0] < now - self.window:
            q.popleft()

        if len(q) >= self.limit:
            retry_after = int(self.window - (now - q[0])) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Max {self.limit} requests/minute.",
                    "retry_after_seconds": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        q.append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"]     = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, self.limit - len(q)))
        return response
