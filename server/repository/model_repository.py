"""
数据库访问层
封装所有 Supabase 查询操作，业务逻辑层不直接操作数据库
"""
import logging
import math
from typing import Any
from urllib.parse import quote

from server.config import supabase

logger = logging.getLogger(__name__)


def _apply_search_filter(query: Any, search: str) -> Any:
    """
    为查询添加搜索过滤条件
    """
    return query.or_(
        f"title.ilike.%{search}%,category.ilike.%{search}%"
    )


def get_models_paginated(
    page: int,
    page_size: int,
    search: str | None = None,
) -> dict[str, Any]:
    """
    分页查询模型列表

    Supabase 的 range 是闭区间 [start, end]，需要据此计算偏移
    """
    offset = (page - 1) * page_size

    # NOTE: 先查总数，用于计算总页数
    count_query = supabase.table("models").select("id", count="exact")
    if search:
        count_query = _apply_search_filter(count_query, search)
    count_result = count_query.execute()
    total = count_result.count or 0

    # 分页查询数据
    data_query = (
        supabase.table("models")
        .select("id, title, category, description, image_url, version")
        .order("created_at", desc=False)
        .range(offset, offset + page_size - 1)
    )
    if search:
        data_query = _apply_search_filter(data_query, search)
    data_result = data_query.execute()

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return {
        "items": data_result.data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_model_by_id(model_id: str) -> dict[str, Any] | None:
    """
    根据 ID 查询单个模型详情

    同时查询关联的 resources 并按 sort_order 排序
    """
    result = (
        supabase.table("models")
        .select("*, resources(*)")
        .eq("id", model_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        return None

    model_data = result.data

    # 对资源按 sort_order 排序
    if model_data.get("resources"):
        model_data["resources"] = sorted(
            model_data["resources"],
            key=lambda r: r.get("sort_order", 0),
        )

    return model_data
