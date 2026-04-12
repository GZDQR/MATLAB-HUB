/**
 * 模型 API 调用层
 * 封装所有与后端的 HTTP 请求，统一错误处理
 */
import { Model, PaginatedResponse } from '../types';

const API_BASE = '/api';

/**
 * 将后端 snake_case 字段转换为前端 camelCase
 * NOTE: Supabase/FastAPI 使用 snake_case，前端约定使用 camelCase
 */
function transformModel(raw: Record<string, unknown>): Model {
  return {
    id: raw.id as string,
    title: raw.title as string,
    category: raw.category as string,
    description: raw.description as string,
    imageUrl: raw.image_url as string,
    version: raw.version as string | undefined,
    longDescription: raw.long_description as string | undefined,
    resources: Array.isArray(raw.resources)
      ? raw.resources.map((r: Record<string, unknown>) => ({
          type: r.type as 'doc' | 'video' | 'shop' | 'link',
          title: r.title as string,
          url: r.url as string,
        }))
      : undefined,
  };
}

/**
 * 获取模型分页列表
 * @param page 页码（从 1 开始）
 * @param pageSize 每页数量
 * @param search 搜索关键词
 * @returns 分页响应数据
 */
export async function fetchModels(
  page: number = 1,
  pageSize: number = 12,
  search?: string
): Promise<PaginatedResponse<Model>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(`${API_BASE}/models?${params}`);

  if (!response.ok) {
    throw new Error(`获取模型列表失败: ${response.status}`);
  }

  const data = await response.json();

  return {
    items: data.items.map(transformModel),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}

/**
 * 获取单个模型详情
 * @param modelId 模型 ID
 * @returns 模型详情数据
 */
export async function fetchModelDetail(modelId: string): Promise<Model> {
  const response = await fetch(`${API_BASE}/models/${modelId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`模型 '${modelId}' 不存在`);
    }
    throw new Error(`获取模型详情失败: ${response.status}`);
  }

  const data = await response.json();
  return transformModel(data);
}
