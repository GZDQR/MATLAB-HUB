"""
Admin 后台服务配置
管理 Supabase 数据库连接和 Cloudflare R2 对象存储连接
"""
import os
import ssl

# HACK: Python 3.10 + OpenSSL 1.1.1 与 Supabase TLS 存在兼容性问题
# 必须在导入任何 HTTP 客户端库之前执行此 patch
# 后续升级 Python 3.12+ 后可移除此 workaround
_default_ctx = ssl.create_default_context()
_default_ctx.set_ciphers("DEFAULT:@SECLEVEL=1")
ssl._create_default_https_context = lambda: _default_ctx

import boto3  # noqa: E402
from botocore.config import Config  # noqa: E402
from dotenv import load_dotenv  # noqa: E402
from supabase import create_client, Client  # noqa: E402

# 读取 .env 文件
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# --- Supabase 配置 ---
SUPABASE_URL: str = os.getenv("SUPABASE_URL") or "https://fallback.supabase.co"
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "fallback_key"

# NOTE: 使用 service_role key 在后端操作数据库，绕过 RLS 策略
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Cloudflare R2 配置 ---
R2_ENDPOINT_URL: str = os.getenv("R2_ENDPOINT_URL") or "https://fallback.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID: str = os.getenv("R2_ACCESS_KEY_ID") or "fallback_key"
R2_SECRET_ACCESS_KEY: str = os.getenv("R2_SECRET_ACCESS_KEY") or "fallback_secret"
R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME") or "fallback_bucket"
R2_PUBLIC_DOMAIN: str = os.getenv("R2_PUBLIC_DOMAIN") or "fallback_domain"

s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
)
