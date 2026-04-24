import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from admin_server.main import app
# Vercel Serverless Function 入口
# Vercel 会自动寻找 app 实例来运行 FastAPI
