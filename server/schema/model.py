"""
Pydantic 数据校验模型
定义 API 请求和响应的数据结构，确保类型安全
"""
from typing import Generic, TypeVar, Optional

from pydantic import BaseModel, Field

T = TypeVar("T")


class ResourceSchema(BaseModel):
    """资源数据结构"""
    id: Optional[int] = None
    model_id: Optional[str] = None
    type: str = Field(..., pattern=r"^(doc|video|shop|link)$")
    title: str
    url: str
    sort_order: int = 0


class ModelSummarySchema(BaseModel):
    """模型列表项（不含资源详情，减少传输量）"""
    id: str
    title: str
    category: str
    description: str
    image_url: str
    version: Optional[str] = None


class ModelDetailSchema(BaseModel):
    """模型详情（包含关联资源）"""
    id: str
    title: str
    category: str
    description: str
    image_url: str
    version: Optional[str] = None
    long_description: Optional[str] = None
    resources: list[ResourceSchema] = []


class PaginatedResponse(BaseModel, Generic[T]):
    """
    通用分页响应结构
    前端依赖此结构计算分页 UI
    """
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
