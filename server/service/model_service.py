"""
业务逻辑层
处理数据转换和业务规则，隔离 API 层与数据库层
"""
import logging

from server.repository import model_repository
from server.schema.model import (
    ModelDetailSchema,
    ModelSummarySchema,
    PaginatedResponse,
    ResourceSchema,
)

logger = logging.getLogger(__name__)

# 分页参数边界值
MAX_PAGE_SIZE = 50
DEFAULT_PAGE_SIZE = 12


def get_models(
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    search: str | None = None,
) -> PaginatedResponse[ModelSummarySchema]:
    """
    获取模型分页列表

    对分页参数做边界校验，防止恶意请求过大数据量
    """
    page = max(1, page)
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))

    raw = model_repository.get_models_paginated(page, page_size, search)

    items = [
        ModelSummarySchema(
            id=m["id"],
            title=m["title"],
            category=m["category"],
            description=m["description"],
            image_url=m["image_url"],
            version=m.get("version"),
        )
        for m in raw["items"]
    ]

    return PaginatedResponse[ModelSummarySchema](
        items=items,
        total=raw["total"],
        page=raw["page"],
        page_size=raw["page_size"],
        total_pages=raw["total_pages"],
    )


def get_model_detail(model_id: str) -> ModelDetailSchema | None:
    """
    获取模型详情（含关联资源）

    返回 None 时由 API 层负责返回 404
    """
    raw = model_repository.get_model_by_id(model_id)

    if not raw:
        return None

    resources = [
        ResourceSchema(
            id=r.get("id"),
            model_id=r.get("model_id"),
            type=r["type"],
            title=r["title"],
            url=r["url"],
            sort_order=r.get("sort_order", 0),
        )
        for r in raw.get("resources", [])
    ]

    return ModelDetailSchema(
        id=raw["id"],
        title=raw["title"],
        category=raw["category"],
        description=raw["description"],
        image_url=raw["image_url"],
        version=raw.get("version"),
        long_description=raw.get("long_description"),
        resources=resources,
    )
