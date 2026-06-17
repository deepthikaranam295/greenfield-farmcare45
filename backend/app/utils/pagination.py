import math
from fastapi import Query


class Pagination:
    def __init__(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
        self.page = page
        self.size = size

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size

    def pages(self, total: int) -> int:
        return max(1, math.ceil(total / self.size))
