from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: Optional[T] = None
    message: Optional[str] = None

    @classmethod
    def ok(cls, data: Any = None, message: str = None):
        return cls(status="success", data=data, message=message)

    @classmethod
    def error(cls, message: str):
        return cls(status="error", message=message)


class PaginatedResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: list[T]
    total: int
    page: int
    size: int
    pages: int
