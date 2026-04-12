"""
FastAPI 应用入口
配置 CORS、路由挂载和日志
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api.models import router as models_router

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="MATLAB Hub API",
    description="MATLAB 模型与资源管理平台后端 API",
    version="1.0.0",
)

# NOTE: 开发环境允许所有来源的跨域请求，生产环境应限制 origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router)


@app.get("/api/health", tags=["system"])
def health_check() -> dict[str, str]:
    """健康检查端点"""
    return {"status": "ok"}
