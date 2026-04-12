"""
初始数据导入脚本
将原前端 constants.ts 中的硬编码数据写入 Supabase

使用方法：
    python scripts/seed_data.py

NOTE: 运行前请确保：
1. .env 文件中已配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
2. Supabase 中已创建 models 和 resources 表（参考下方 SQL）

-- 建表 SQL（在 Supabase SQL Editor 中执行）：
-- CREATE TABLE IF NOT EXISTS models (
--     id TEXT PRIMARY KEY,
--     title TEXT NOT NULL,
--     category TEXT NOT NULL,
--     description TEXT NOT NULL,
--     image_url TEXT NOT NULL,
--     version TEXT,
--     long_description TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE TABLE IF NOT EXISTS resources (
--     id SERIAL PRIMARY KEY,
--     model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
--     type TEXT NOT NULL CHECK (type IN ('doc', 'video', 'shop', 'link')),
--     title TEXT NOT NULL,
--     url TEXT NOT NULL,
--     sort_order INT DEFAULT 0
-- );
--
-- CREATE INDEX idx_resources_model_id ON resources(model_id);
"""
import os
import sys

# 确保能导入 server 包
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("错误：请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 每个模型的通用资源模板
COMMON_RESOURCES = [
    {"type": "doc", "title": "建模教程文件", "url": "#", "sort_order": 0},
    {"type": "video", "title": "建模教学视频", "url": "#", "sort_order": 1},
    {"type": "shop", "title": "模型购买商店", "url": "#", "sort_order": 2},
    {"type": "link", "title": "参考文献网址", "url": "#", "sort_order": 3},
]

MODELS = [
    {
        "id": "robotic-arm",
        "title": "六轴工业机器人运动学",
        "category": "机器人学",
        "description": "基于DH参数的工业机器人正逆运动学仿真，包含奇异点避障算法。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCZFV2M8qdxZBVa_XVFKXixYlYfDJUNArtSOieR6HyX1yQ7NEuc7NO6HNKlhmRAglClt9cDGHlgmjgN5WBlMwfrIWT-wmgxA36339crQEF5iWiCenKp7HA0V8CnFLS-oPDN_BSRIwOUigCFOlvwQyPYWDgOqRoOZHzWwkVIunBPe4WBA5KhYIk614ZwR0O9RZ0ebVUJ5yTXpwrY2Pw3MsZefZMEKfrY8iCpa6DybIUlauHLv-uUyJWYT1cN3sDldB3C16KsfBfzx10",
        "version": "v2.4",
        "long_description": "本模型基于 MATLAB Simulink 平台开发，旨在为六轴工业机器人提供高精度的动力学建模与路径规划仿真。通过集成最新的控制算法，用户可以在虚拟环境中模拟复杂的抓取、焊接及码垛任务，显著降低实际调试中的碰撞风险与硬件损耗。\n\n其核心优势在于引入了自适应阻抗控制技术，能够处理与柔性环境接触时的力反馈交互。同时，模型提供了完整的参数化接口，支持从 DH 参数到电机力矩常数的深度自定义。",
    },
    {
        "id": "pid-controller",
        "title": "先进自适应PID控制器",
        "category": "控制系统",
        "description": "针对非线性系统设计的参数自调优PID控制模型，支持实时仿真。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDCm708kqz-_tJVvScDfJauEHGSKhT28H-r_WJynw8drEl83Hrvs81tpt3zB2TK-A1NyhBkfs1vBbwVjVZv-AsQ3XiyzWpghneq6n32LheQuxIBL0Mkt7wkEXz8bR6geTcXak9Qvb6l4QSmMvatq1N7Wvm5eGqPLqqSzW6QXFk8xWl__uAkqbdPFguO9m6SuJ3lNjyOOy6uR1vdAeKixPZpGJINxTLSoHGdPfmnWK1y6vnpgMcWyWwFYYhSFsTfXdgv0RJIgFsZobA",
        "version": "v1.2",
    },
    {
        "id": "svm-algorithm",
        "title": "三相逆变器SVM算法",
        "category": "电力电子",
        "description": "高效率空间矢量调制算法实现，适用于电机驱动系统开发。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAfmivbyDbKI1dLxMLn9u4wNZesGk3XQQcX-wZOxWZtPIgOWF1SShNcMy2asKc8Ra9Q9IBHv23XFTpPKqKK62ycdHOYnzmuA0EYElqYS2ktSXpf-0A2LDh-OYyz4nrM5b-tzMzciiWFvFVAIPSCho90RHocO86i_z_451MjRdjqVdguRWjf4gDZEQmTaaFge2V0nathtz8Wb2HGgNyJ1727UJbbMZ90gcoFp8u3zMJvHyiDws3j3uVgYXg77PPIAihuUKWqySOs5Ow",
        "version": "v3.0",
    },
    {
        "id": "parking-system",
        "title": "自动泊车系统建模",
        "category": "人工智能",
        "description": "基于MPC控制器的自动泊车路径规划与控制仿真模型。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBiSa9_eoVl-JQ4bDEhC9cRlj-05Q2RJus27VOzUPfVwQTecJ78IFapBx_6kslh2PBcG31v3nr0xFGfJineppGFhwae4te9cSciRi0Q2N2TJMim0PqwkOjglQuzdxuYw1DMG6Q5siJ_zW8F1UxBHRoklxHlsQP5byXGtkKyLKpN08dQyRj1MBhYy1TjhLdHJ8PwSkTW89Mi43HIx4Yr6ZJAFMVy-r7IdKnxkFerb3AcBgTkbGbeYYgSWtHGwYJTEXYnsLUHzFCOBQ4",
        "version": "v1.5",
    },
    {
        "id": "5g-channel",
        "title": "5G 信道建模仿真",
        "category": "通信工程",
        "description": "符合3GPP标准的5G NR链路级信道建模与吞吐量评估。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDCm708kqz-_tJVvScDfJauEHGSKhT28H-r_WJynw8drEl83Hrvs81tpt3zB2TK-A1NyhBkfs1vBbwVjVZv-AsQ3XiyzWpghneq6n32LheQuxIBL0Mkt7wkEXz8bR6geTcXak9Qvb6l4QSmMvatq1N7Wvm5eGqPLqqSzW6QXFk8xWl__uAkqbdPFguO9m6SuJ3lNjyOOy6uR1vdAeKixPZpGJINxTLSoHGdPfmnWK1y6vnpgMcWyWwFYYhSFsTfXdgv0RJIgFsZobA",
        "version": "v2.1",
    },
    {
        "id": "fourier-optics",
        "title": "傅里叶光学全息成像",
        "category": "信号处理",
        "description": "计算全息成像(CGH)算法实现及波前重构仿真分析。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA24t5vTkVz95Sk6Jeb5eqY8arIgJuALzkv-InlsNu1Ne2iGskKDufBn6gXPfQsssEhD6noFJDSsTg-5CUMt7e5bz6z8699my5EfGK4mLaiivuLX971b0xdSUOk32jpiHBE0JY-Bnwj4Gy7I_U-Ks_KQLawKn4L5CCa3QiGLEWlxda5bpgxRv55avUTEvSc_ziCeJHU7Mn1sBjcTDg9sxBHPbGwpn0PqKuFPMGr-OOFNcV1fw5BDp0WdPjOxoP4sVYXThh76bnX8-0",
        "version": "v1.0",
    },
    {
        "id": "distributed-cache",
        "title": "分布式缓存一致性模型",
        "category": "计算机系统",
        "description": "多核处理器缓存一致性协议(MESI)的行为级状态机模型。",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDZHS8T7PGhc7dCXut2uaGdIF1KwdGedI0x-aO144lzXtAL009LzaA6IRLOi60sgQMk4W45O_2uw4EWSxMlvy8WrJwGfAI8EBgUOyrGcOdA3h8cAHpXQDTaoUkiPV7ABKZd-3JIaE_uRciaBiT4Fl_ushfpi3eXjzvyVFtPah06nvFVlKmQNGUAO13nex1ixFUWXP1dcFZ-cIEPXhg6cqtyoobDIJikv1SNOFlrfErvM4oKqxxTk0oqVRkhsKxfDMGN6-T0COcr1UU",
        "version": "v2.0",
    },
    {
        "id": "heat-transfer",
        "title": "传热过程数值仿真",
        "category": "热力学",
        "description": "基于有限元分析的稳态与瞬态传热数学模型实现。",
        "image_url": "https://picsum.photos/seed/heat/800/1000",
        "version": "v1.1",
    },
]


def seed() -> None:
    """执行数据导入"""
    print("🚀 开始导入初始数据...")

    # 清空旧数据（resources 有外键级联删除，先删 resources 再删 models）
    print("  清空旧数据...")
    supabase.table("resources").delete().neq("id", 0).execute()
    supabase.table("models").delete().neq("id", "").execute()

    # 插入模型数据
    print(f"  插入 {len(MODELS)} 个模型...")
    supabase.table("models").insert(MODELS).execute()

    # 为每个模型插入资源
    all_resources = []
    for model in MODELS:
        for res in COMMON_RESOURCES:
            all_resources.append({**res, "model_id": model["id"]})

    print(f"  插入 {len(all_resources)} 条资源...")
    supabase.table("resources").insert(all_resources).execute()

    print("✅ 数据导入完成！")


if __name__ == "__main__":
    seed()
