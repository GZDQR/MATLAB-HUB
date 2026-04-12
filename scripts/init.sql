-- MATLAB Hub 数据库初始化 SQL
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 模型表
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    version TEXT,
    long_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 资源表（与模型一对多关系）
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('doc', 'video', 'shop', 'link')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 索引：加速按模型 ID 查询资源
CREATE INDEX IF NOT EXISTS idx_resources_model_id ON resources(model_id);

-- 索引：加速分类和标题搜索
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
CREATE INDEX IF NOT EXISTS idx_models_title ON models(title);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 初始测试数据（来源于原前端 constants.ts）
-- =============================================

INSERT INTO models (id, title, category, description, image_url, version, long_description) VALUES
(
    'robotic-arm',
    '六轴工业机器人运动学',
    '机器人学',
    '基于DH参数的工业机器人正逆运动学仿真，包含奇异点避障算法。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCZFV2M8qdxZBVa_XVFKXixYlYfDJUNArtSOieR6HyX1yQ7NEuc7NO6HNKlhmRAglClt9cDGHlgmjgN5WBlMwfrIWT-wmgxA36339crQEF5iWiCenKp7HA0V8CnFLS-oPDN_BSRIwOUigCFOlvwQyPYWDgOqRoOZHzWwkVIunBPe4WBA5KhYIk614ZwR0O9RZ0ebVUJ5yTXpwrY2Pw3MsZefZMEKfrY8iCpa6DybIUlauHLv-uUyJWYT1cN3sDldB3C16KsfBfzx10',
    'v2.4',
    E'本模型基于 MATLAB Simulink 平台开发，旨在为六轴工业机器人提供高精度的动力学建模与路径规划仿真。通过集成最新的控制算法，用户可以在虚拟环境中模拟复杂的抓取、焊接及码垛任务，显著降低实际调试中的碰撞风险与硬件损耗。\n\n其核心优势在于引入了自适应阻抗控制技术，能够处理与柔性环境接触时的力反馈交互。同时，模型提供了完整的参数化接口，支持从 DH 参数到电机力矩常数的深度自定义。'
),
(
    'pid-controller',
    '先进自适应PID控制器',
    '控制系统',
    '针对非线性系统设计的参数自调优PID控制模型，支持实时仿真。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDCm708kqz-_tJVvScDfJauEHGSKhT28H-r_WJynw8drEl83Hrvs81tpt3zB2TK-A1NyhBkfs1vBbwVjVZv-AsQ3XiyzWpghneq6n32LheQuxIBL0Mkt7wkEXz8bR6geTcXak9Qvb6l4QSmMvatq1N7Wvm5eGqPLqqSzW6QXFk8xWl__uAkqbdPFguO9m6SuJ3lNjyOOy6uR1vdAeKixPZpGJINxTLSoHGdPfmnWK1y6vnpgMcWyWwFYYhSFsTfXdgv0RJIgFsZobA',
    'v1.2',
    NULL
),
(
    'svm-algorithm',
    '三相逆变器SVM算法',
    '电力电子',
    '高效率空间矢量调制算法实现，适用于电机驱动系统开发。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAfmivbyDbKI1dLxMLn9u4wNZesGk3XQQcX-wZOxWZtPIgOWF1SShNcMy2asKc8Ra9Q9IBHv23XFTpPKqKK62ycdHOYnzmuA0EYElqYS2ktSXpf-0A2LDh-OYyz4nrM5b-tzMzciiWFvFVAIPSCho90RHocO86i_z_451MjRdjqVdguRWjf4gDZEQmTaaFge2V0nathtz8Wb2HGgNyJ1727UJbbMZ90gcoFp8u3zMJvHyiDws3j3uVgYXg77PPIAihuUKWqySOs5Ow',
    'v3.0',
    NULL
),
(
    'parking-system',
    '自动泊车系统建模',
    '人工智能',
    '基于MPC控制器的自动泊车路径规划与控制仿真模型。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBiSa9_eoVl-JQ4bDEhC9cRlj-05Q2RJus27VOzUPfVwQTecJ78IFapBx_6kslh2PBcG31v3nr0xFGfJineppGFhwae4te9cSciRi0Q2N2TJMim0PqwkOjglQuzdxuYw1DMG6Q5siJ_zW8F1UxBHRoklxHlsQP5byXGtkKyLKpN08dQyRj1MBhYy1TjhLdHJ8PwSkTW89Mi43HIx4Yr6ZJAFMVy-r7IdKnxkFerb3AcBgTkbGbeYYgSWtHGwYJTEXYnsLUHzFCOBQ4',
    'v1.5',
    NULL
),
(
    '5g-channel',
    '5G 信道建模仿真',
    '通信工程',
    '符合3GPP标准的5G NR链路级信道建模与吞吐量评估。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDCm708kqz-_tJVvScDfJauEHGSKhT28H-r_WJynw8drEl83Hrvs81tpt3zB2TK-A1NyhBkfs1vBbwVjVZv-AsQ3XiyzWpghneq6n32LheQuxIBL0Mkt7wkEXz8bR6geTcXak9Qvb6l4QSmMvatq1N7Wvm5eGqPLqqSzW6QXFk8xWl__uAkqbdPFguO9m6SuJ3lNjyOOy6uR1vdAeKixPZpGJINxTLSoHGdPfmnWK1y6vnpgMcWyWwFYYhSFsTfXdgv0RJIgFsZobA',
    'v2.1',
    NULL
),
(
    'fourier-optics',
    '傅里叶光学全息成像',
    '信号处理',
    '计算全息成像(CGH)算法实现及波前重构仿真分析。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA24t5vTkVz95Sk6Jeb5eqY8arIgJuALzkv-InlsNu1Ne2iGskKDufBn6gXPfQsssEhD6noFJDSsTg-5CUMt7e5bz6z8699my5EfGK4mLaiivuLX971b0xdSUOk32jpiHBE0JY-Bnwj4Gy7I_U-Ks_KQLawKn4L5CCa3QiGLEWlxda5bpgxRv55avUTEvSc_ziCeJHU7Mn1sBjcTDg9sxBHPbGwpn0PqKuFPMGr-OOFNcV1fw5BDp0WdPjOxoP4sVYXThh76bnX8-0',
    'v1.0',
    NULL
),
(
    'distributed-cache',
    '分布式缓存一致性模型',
    '计算机系统',
    '多核处理器缓存一致性协议(MESI)的行为级状态机模型。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDZHS8T7PGhc7dCXut2uaGdIF1KwdGedI0x-aO144lzXtAL009LzaA6IRLOi60sgQMk4W45O_2uw4EWSxMlvy8WrJwGfAI8EBgUOyrGcOdA3h8cAHpXQDTaoUkiPV7ABKZd-3JIaE_uRciaBiT4Fl_ushfpi3eXjzvyVFtPah06nvFVlKmQNGUAO13nex1ixFUWXP1dcFZ-cIEPXhg6cqtyoobDIJikv1SNOFlrfErvM4oKqxxTk0oqVRkhsKxfDMGN6-T0COcr1UU',
    'v2.0',
    NULL
),
(
    'heat-transfer',
    '传热过程数值仿真',
    '热力学',
    '基于有限元分析的稳态与瞬态传热数学模型实现。',
    'https://picsum.photos/seed/heat/800/1000',
    'v1.1',
    NULL
);

-- 为每个模型插入 4 条资源链接
-- NOTE: url 字段是实际跳转地址，后续可直接在 Supabase 数据库中修改
-- 修改步骤：Supabase Dashboard > Table Editor > resources > 找到对应行 > 编辑 url 列

INSERT INTO resources (model_id, type, title, url, sort_order) VALUES
-- 六轴工业机器人运动学
('robotic-arm', 'doc',   '建模教程文件', 'https://example.com/robotic-arm/doc',   0),
('robotic-arm', 'video', '建模教学视频', 'https://example.com/robotic-arm/video', 1),
('robotic-arm', 'shop',  '模型购买商店', 'https://example.com/robotic-arm/shop',  2),
('robotic-arm', 'link',  '参考文献网址', 'https://example.com/robotic-arm/ref',   3),
-- 先进自适应PID控制器
('pid-controller', 'doc',   '建模教程文件', 'https://example.com/pid-controller/doc',   0),
('pid-controller', 'video', '建模教学视频', 'https://example.com/pid-controller/video', 1),
('pid-controller', 'shop',  '模型购买商店', 'https://example.com/pid-controller/shop',  2),
('pid-controller', 'link',  '参考文献网址', 'https://example.com/pid-controller/ref',   3),
-- 三相逆变器SVM算法
('svm-algorithm', 'doc',   '建模教程文件', 'https://example.com/svm-algorithm/doc',   0),
('svm-algorithm', 'video', '建模教学视频', 'https://example.com/svm-algorithm/video', 1),
('svm-algorithm', 'shop',  '模型购买商店', 'https://example.com/svm-algorithm/shop',  2),
('svm-algorithm', 'link',  '参考文献网址', 'https://example.com/svm-algorithm/ref',   3),
-- 自动泊车系统建模
('parking-system', 'doc',   '建模教程文件', 'https://example.com/parking-system/doc',   0),
('parking-system', 'video', '建模教学视频', 'https://example.com/parking-system/video', 1),
('parking-system', 'shop',  '模型购买商店', 'https://example.com/parking-system/shop',  2),
('parking-system', 'link',  '参考文献网址', 'https://example.com/parking-system/ref',   3),
-- 5G 信道建模仿真
('5g-channel', 'doc',   '建模教程文件', 'https://example.com/5g-channel/doc',   0),
('5g-channel', 'video', '建模教学视频', 'https://example.com/5g-channel/video', 1),
('5g-channel', 'shop',  '模型购买商店', 'https://example.com/5g-channel/shop',  2),
('5g-channel', 'link',  '参考文献网址', 'https://example.com/5g-channel/ref',   3),
-- 傅里叶光学全息成像
('fourier-optics', 'doc',   '建模教程文件', 'https://example.com/fourier-optics/doc',   0),
('fourier-optics', 'video', '建模教学视频', 'https://example.com/fourier-optics/video', 1),
('fourier-optics', 'shop',  '模型购买商店', 'https://example.com/fourier-optics/shop',  2),
('fourier-optics', 'link',  '参考文献网址', 'https://example.com/fourier-optics/ref',   3),
-- 分布式缓存一致性模型
('distributed-cache', 'doc',   '建模教程文件', 'https://example.com/distributed-cache/doc',   0),
('distributed-cache', 'video', '建模教学视频', 'https://example.com/distributed-cache/video', 1),
('distributed-cache', 'shop',  '模型购买商店', 'https://example.com/distributed-cache/shop',  2),
('distributed-cache', 'link',  '参考文献网址', 'https://example.com/distributed-cache/ref',   3),
-- 传热过程数值仿真
('heat-transfer', 'doc',   '建模教程文件', 'https://example.com/heat-transfer/doc',   0),
('heat-transfer', 'video', '建模教学视频', 'https://example.com/heat-transfer/video', 1),
('heat-transfer', 'shop',  '模型购买商店', 'https://example.com/heat-transfer/shop',  2),
('heat-transfer', 'link',  '参考文献网址', 'https://example.com/heat-transfer/ref',   3);
