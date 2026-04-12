/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  ShoppingCart,
  Link as LinkIcon,
  ArrowRight,
  PlayCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Model, Resource } from './types';
import { useModels, useModelDetail } from './hooks/use-models';

// NOTE: 每页展示的模型数量，后端会根据此值和模型总数自动计算总页数
// 模型不足一页时不显示分页控件，超过时自动增加页数
const PAGE_SIZE = 8;

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: modelsData, loading, error } = useModels(currentPage, PAGE_SIZE, searchQuery);
  const { model: selectedModel, loading: detailLoading } = useModelDetail(selectedModelId);

  /**
   * 搜索时重置到第一页，避免越界
   */
  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  /**
   * 回车触发搜索
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleBack = () => setSelectedModelId(null);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // 翻页后滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary selection:text-on-primary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <button
              onClick={() => { setSelectedModelId(null); setCurrentPage(1); setSearchQuery(''); setSearchInput(''); }}
              className="text-xl font-bold tracking-tighter text-primary font-display hover:opacity-80 transition-opacity"
            >
              MATLAB {selectedModelId ? 'Share' : 'Hub'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container-highest/50 transition-all duration-300 scale-95 active:opacity-80">
              <User className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-20">
        <AnimatePresence mode="wait">
          {!selectedModelId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <section className="max-w-7xl mx-auto px-8 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent leading-tight">
                  探索科研与工程的无限可能
                </h1>
                <div className="max-w-3xl mx-auto relative mt-8">
                  <div className="bg-surface-container-highest p-1 rounded-xl flex items-center shadow-2xl border border-white/5">
                    <Search className="ml-4 text-primary w-5 h-5" />
                    <input
                      className="bg-transparent border-none focus:ring-0 text-on-surface w-full py-3 px-4 text-lg placeholder:text-on-surface-variant/50 outline-none"
                      placeholder="搜索模型、算法或应用领域..."
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                    <button
                      className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                      onClick={handleSearch}
                    >
                      搜索
                    </button>
                  </div>
                </div>
              </section>

              {/* Model Grid */}
              <section className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    所有模型
                    {modelsData && (
                      <span className="text-sm text-on-surface-variant font-normal ml-2">
                        共 {modelsData.total} 个
                      </span>
                    )}
                  </h2>
                </div>

                {/* 加载状态 */}
                {loading && (
                  <div className="flex justify-center items-center py-32">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="ml-3 text-on-surface-variant">加载中...</span>
                  </div>
                )}

                {/* 错误状态 */}
                {error && !loading && (
                  <div className="text-center py-32">
                    <p className="text-error text-lg mb-4">加载失败：{error}</p>
                    <p className="text-on-surface-variant text-sm">请检查后端服务是否已启动</p>
                  </div>
                )}

                {/* 空状态 */}
                {!loading && !error && modelsData?.items.length === 0 && (
                  <div className="text-center py-32">
                    <p className="text-on-surface-variant text-lg">未找到匹配的模型</p>
                  </div>
                )}

                {/* 模型卡片网格 */}
                {!loading && !error && modelsData && modelsData.items.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                      {modelsData.items.map((model) => (
                        <ModelCard
                          key={model.id}
                          model={model}
                          onClick={() => setSelectedModelId(model.id)}
                        />
                      ))}
                    </div>

                    {/* 分页控件 */}
                    {modelsData.totalPages > 1 && (
                      <Pagination
                        currentPage={modelsData.page}
                        totalPages={modelsData.totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-8 py-12"
            >
              {detailLoading && (
                <div className="flex justify-center items-center py-32">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="ml-3 text-on-surface-variant">加载详情...</span>
                </div>
              )}
              {selectedModel && !detailLoading && (
                <ModelDetailView model={selectedModel} onBack={handleBack} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 mt-auto bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-[1440px] mx-auto border-t border-surface-variant/10 pt-8">
          <div className="flex gap-8 mb-4 md:mb-0">
            <a className="text-xs font-light tracking-widest text-outline hover:text-primary transition-colors" href="#">使用条款</a>
            <a className="text-xs font-light tracking-widest text-outline hover:text-primary transition-colors" href="#">隐私政策</a>
            <a className="text-xs font-light tracking-widest text-outline hover:text-primary transition-colors" href="#">联系支持</a>
          </div>
          <p className="text-xs font-light tracking-widest text-outline">© 2024 MATLAB Hub. 计算之澄明.</p>
        </div>
      </footer>
    </div>
  );
}

// ==================== 分页组件 ====================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * 分页控件
 * 显示首页、末页、当前页及其前后各 1 页，中间用省略号连接
 */
function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  /**
   * 生成分页页码数组
   * 规则：始终显示第 1 页和最后一页，当前页前后各 1 页，其余用 -1 表示省略号
   */
  const pages = useMemo(() => {
    const result: number[] = [];
    const showPages = new Set<number>();

    showPages.add(1);
    showPages.add(totalPages);

    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      showPages.add(i);
    }

    const sorted = Array.from(showPages).sort((a, b) => a - b);

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push(-1); // 省略号占位
      }
      result.push(sorted[i]);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-20 flex justify-center items-center gap-2">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, idx) =>
        page === -1 ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-on-surface-variant/50">...</span>
        ) : (
          <button
            key={page}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${page === currentPage
              ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== 模型卡片 ====================

interface ModelCardProps {
  model: Model;
  onClick: () => void;
}

function ModelCard({ model, onClick }: ModelCardProps) {
  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/5] bg-surface-container rounded-xl mb-4 overflow-hidden relative shadow-lg card-hover">
        <img
          alt={model.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110 transition-transform"
          src={model.imageUrl}
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{model.category}</span>
        </div>
      </div>
      <h5 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{model.title}</h5>
      <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed">{model.description}</p>
    </div>
  );
}

// ==================== 模型详情 ====================

interface ModelDetailViewProps {
  model: Model;
  onBack: () => void;
}

function ModelDetailView({ model, onBack }: ModelDetailViewProps) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>返回列表</span>
          </button>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-on-surface">
          {model.title} <span className="text-primary opacity-80">{model.version}</span>
        </h1>
        <div className="mt-4 relative group rounded-xl overflow-hidden bg-surface-container-low aspect-video shadow-2xl border border-white/5">
          <img
            alt={model.title}
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            src={model.imageUrl}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <article className="space-y-6">
            <h2 className="text-2xl font-bold font-headline border-l-4 border-primary pl-4">模型深度解析</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg whitespace-pre-wrap">
              {model.longDescription || model.description}
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-xl">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">相关资源库</h3>
            <div className="flex flex-col gap-4">
              {model.resources && model.resources.length > 0 ? (
                model.resources.map((resource, idx) => (
                  <ResourceLink key={idx} resource={resource} />
                ))
              ) : (
                <div className="text-on-surface-variant/50 text-sm italic py-4 text-center border border-dashed border-outline-variant/20 rounded-lg">
                  暂无相关资源
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==================== 资源链接 ====================

interface ResourceLinkProps {
  resource: Resource;
}

function ResourceLink({ resource }: ResourceLinkProps) {
  const Icon = {
    doc: FileText,
    video: Video,
    shop: ShoppingCart,
    link: LinkIcon
  }[resource.type];

  const ActionIcon = {
    doc: ArrowRight,
    video: PlayCircle,
    shop: ExternalLink,
    link: LinkIcon
  }[resource.type];

  const colorClass = {
    doc: 'bg-primary/10 text-primary',
    video: 'bg-tertiary/10 text-tertiary',
    shop: 'bg-secondary/10 text-secondary',
    link: 'bg-on-surface-variant/10 text-on-surface-variant'
  }[resource.type];

  const hoverColorClass = {
    doc: 'group-hover:text-primary',
    video: 'group-hover:text-tertiary',
    shop: 'group-hover:text-secondary',
    link: 'group-hover:text-primary'
  }[resource.type];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 rounded-lg bg-surface hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant/30"
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-grow">
        <div className={`text-sm font-bold text-on-surface ${hoverColorClass} transition-colors`}>
          {resource.title}
        </div>
      </div>
      <ActionIcon className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
