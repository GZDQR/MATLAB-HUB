export interface Resource {
  id?: number;
  type: 'doc' | 'video' | 'shop' | 'link';
  title: string;
  url: string;
  sort_order: number;
}

export interface Model {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  version: string;
  resources: Resource[];
}

const API_BASE = '/api';

export const fetchModels = async (): Promise<Model[]> => {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  // Ensure default empty resources if missing
  return data.map((m: any) => ({ ...m, resources: m.resources || [] }));
};

export const deleteModel = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/models/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete model');
};

export const saveModel = async (model: Model): Promise<void> => {
  const res = await fetch(`${API_BASE}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model),
  });
  if (!res.ok) throw new Error('Failed to save model');
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  return data.url;
};
