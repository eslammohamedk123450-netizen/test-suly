"""Rate limiting dependency for per-user request limiting."""
import time

from backend.app.schemas.chat import RateLimitInfo


class RateLimiter:
    """Process-local per-user rate limiter.

    Production deployments with more than one process should replace this with
    a shared Redis or database-backed implementation.
    """

    def __init__(self, limit: int = 100, period: int = 3600):
        self.limit = limit
        self.period = period
        self.requests: dict[str, list[float]] = {}

    def check(self, user_id: int) -> tuple[bool, RateLimitInfo]:
        now = time.time()
        key = f"user_{user_id}"
        timestamps = self.requests.setdefault(key, [])
        timestamps[:] = [timestamp for timestamp in timestamps if now - timestamp < self.period]

        count = len(timestamps)
        if count >= self.limit:
            reset_at = min(timestamps) + self.period
            return (
                False,
                RateLimitInfo(
                    limit=self.limit,
                    remaining=0,
                    reset_at=str(reset_at),
                    retry_after=max(1, int(reset_at - now) + 1),
                ),
            )

        timestamps.append(now)
        return (
            True,
            RateLimitInfo(
                limit=self.limit,
                remaining=max(0, self.limit - count - 1),
                reset_at=str(int(now + self.period)),
                retry_after=None,
            ),
        )
