/**
 * 模型数据获取自定义 Hooks
 * 管理加载状态、错误状态和数据缓存
 */
import { useState, useEffect, useCallback } from 'react';
import { Model, PaginatedResponse } from '../types';
import { fetchModels, fetchModelDetail } from '../api/model-api';

interface UseModelsResult {
  data: PaginatedResponse<Model> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 获取模型分页列表
 * @param page 当前页码
 * @param pageSize 每页数量
 * @param search 搜索关键词
 */
export function useModels(
  page: number,
  pageSize: number = 12,
  search?: string
): UseModelsResult {
  const [data, setData] = useState<PaginatedResponse<Model> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchModels(page, pageSize, search);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

interface UseModelDetailResult {
  model: Model | null;
  loading: boolean;
  error: string | null;
}

/**
 * 获取单个模型详情
 * @param modelId 模型 ID，为 null 时不发起请求
 */
export function useModelDetail(modelId: string | null): UseModelDetailResult {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setModel(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchModelDetail(modelId);
        if (!cancelled) {
          setModel(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    // NOTE: 清理函数防止组件卸载后的状态更新
    return () => {
      cancelled = true;
    };
  }, [modelId]);

  return { model, loading, error };
}
