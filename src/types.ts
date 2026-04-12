export interface Model {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  version?: string;
  longDescription?: string;
  resources?: Resource[];
}

export interface Resource {
  type: 'doc' | 'video' | 'shop' | 'link';
  title: string;
  url: string;
}

/**
 * 通用分页响应结构，与后端 PaginatedResponse 对应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
