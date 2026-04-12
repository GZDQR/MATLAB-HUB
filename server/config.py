"""
Supabase 数据库连接配置
从环境变量读取 Supabase URL 和密钥，创建全局客户端实例
"""
import os
import ssl

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# HACK: Python 3.10 + OpenSSL 1.1.1 与 Supabase TLS 存在兼容性问题
# 通过修改默认 SSL 上下文降低安全级别，确保 HTTPS 连接成功
# 后续升级 Python 3.12+ 后可移除此 workaround
_default_ctx = ssl.create_default_context()
_default_ctx.set_ciphers("DEFAULT:@SECLEVEL=1")
ssl._create_default_https_context = lambda: _default_ctx

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "缺少 Supabase 配置。请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY"
    )

# NOTE: 使用 service_role key 在后端操作数据库，绕过 RLS 策略
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
