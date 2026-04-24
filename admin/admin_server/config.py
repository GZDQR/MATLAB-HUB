"""
Admin 后台服务配置
管理 Supabase 数据库连接和 Cloudflare R2 对象存储连接
"""
import os
import logging

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# 读取 .env 文件
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# --- Supabase 配置 ---
SUPABASE_URL: str = os.getenv("SUPABASE_URL") or "https://placeholder.supabase.co"
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "placeholder_key"

# NOTE: 使用 service_role key 在后端操作数据库，绕过 RLS 策略
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Cloudflare R2 配置 ---
R2_ENDPOINT_URL: str = os.getenv("R2_ENDPOINT_URL") or "https://placeholder.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID: str = os.getenv("R2_ACCESS_KEY_ID") or "placeholder_key"
R2_SECRET_ACCESS_KEY: str = os.getenv("R2_SECRET_ACCESS_KEY") or "placeholder_secret"
R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME") or "placeholder_bucket"
R2_PUBLIC_DOMAIN: str = os.getenv("R2_PUBLIC_DOMAIN") or "https://placeholder.r2.dev"

s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
)
