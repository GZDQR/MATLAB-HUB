from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from admin_server.config import supabase

router = APIRouter()

class ResourceItem(BaseModel):
    id: Optional[int] = None
    type: str  # doc, video, shop, link
    title: str
    url: str
    sort_order: int

class ModelUpdate(BaseModel):
    id: str
    title: str
    category: str
    description: str
    image_url: str
    version: str
    resources: List[ResourceItem]

@router.get("/models")
async def get_all_models():
    # Admin 端需要获取所有模型进行管理，此处不分页或使用大分页
    res = supabase.table("models").select("*, resources(*)").order("created_at", desc=False).execute()
    return res.data

@router.delete("/models/{model_id}")
async def delete_model(model_id: str):
    # 根据已配置的 cascade delete，删除 model 也会删除关联的 resources
    res = supabase.table("models").delete().eq("id", model_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"message": "success"}

@router.post("/models")
async def save_model(payload: ModelUpdate):
    # 如果 payload.id 存在于数据库，则是更新，否则是插入
    model_data = {
        "id": payload.id,
        "title": payload.title,
        "category": payload.category,
        "description": payload.description,
        "image_url": payload.image_url,
        "version": payload.version
    }
    
    # Upsert 模型表
    res = supabase.table("models").upsert(model_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save model")
        
    # 对于 resources 的全量更新，先删除这个模型已有的所有 resources，再重新插入
    supabase.table("resources").delete().eq("model_id", payload.id).execute()
    
    if payload.resources:
        resources_data = []
        for r in payload.resources:
            resources_data.append({
                "model_id": payload.id,
                "type": r.type,
                "title": r.title,
                "url": r.url,
                "sort_order": r.sort_order
            })
        supabase.table("resources").insert(resources_data).execute()
        
    return {"message": "success", "id": payload.id}
