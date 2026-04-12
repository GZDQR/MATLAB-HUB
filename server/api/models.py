"""
模型相关 API 路由
负责请求解析与响应封装，不包含业务逻辑
"""
import logging

from fastapi import APIRouter, HTTPException, Query

from server.schema.model import (
    ModelDetailSchema,
    ModelSummarySchema,
    PaginatedResponse,
)
from server.service import model_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get(
    "",
    response_model=PaginatedResponse[ModelSummarySchema],
    summary="获取模型分页列表",
)
def list_models(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(12, ge=1, le=50, description="每页数量"),
    search: str | None = Query(None, max_length=100, description="搜索关键词"),
) -> PaginatedResponse[ModelSummarySchema]:
    """
    获取模型分页列表，支持按标题和分类搜索
    """
    return model_service.get_models(page, page_size, search)


@router.get(
    "/{model_id}",
    response_model=ModelDetailSchema,
    summary="获取模型详情",
)
def get_model(model_id: str) -> ModelDetailSchema:
    """
    根据模型 ID 获取详情，包含关联资源
    """
    result = model_service.get_model_detail(model_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"模型 '{model_id}' 不存在")
    return result
