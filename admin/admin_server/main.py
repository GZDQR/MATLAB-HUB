import ssl
_default_ctx = ssl.create_default_context()
_default_ctx.set_ciphers("DEFAULT:@SECLEVEL=1")
ssl._create_default_https_context = lambda: _default_ctx

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from admin_server.api.upload import router as upload_router
from admin_server.api.admin_models import router as models_router

app = FastAPI(title="MATLAB Hub Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")
app.include_router(models_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "admin_ok"}
