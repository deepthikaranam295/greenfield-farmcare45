import json
from typing import Optional, Any
import redis
from app.core.config import settings
from app.core.logging import logger

_client: Optional[redis.Redis] = None


def get_redis() -> Optional[redis.Redis]:
    global _client
    if _client is None:
        try:
            _client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            _client.ping()
        except Exception as e:
            logger.warning("Redis unavailable: %s", e)
            _client = None
    return _client


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = get_redis()
    if r:
        try:
            r.setex(key, ttl, json.dumps(value, default=str))
        except Exception as e:
            logger.warning("Cache set failed: %s", e)


def cache_get(key: str) -> Optional[Any]:
    r = get_redis()
    if r:
        try:
            v = r.get(key)
            return json.loads(v) if v else None
        except Exception as e:
            logger.warning("Cache get failed: %s", e)
    return None


def cache_delete(key: str) -> None:
    r = get_redis()
    if r:
        try:
            r.delete(key)
        except Exception:
            pass
