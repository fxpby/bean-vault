import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { WISHLIST_PRIORITY_OPTIONS } from '../constants';
import { useWishlistStore } from '../store/wishlistStore';
import type { WishlistPriority } from '../types/bean';
import {
  compareWishlistByCreatedAt,
  compareWishlistByPriority,
  searchWishlistItems,
} from '../utils/wishlist';

type WishlistPriorityFilter = WishlistPriority | 'all';
type WishlistSortMode = 'createdAt' | 'priority';

export function WishlistPage() {
  const navigate = useNavigate();
  const items = useWishlistStore((s) => s.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<WishlistPriorityFilter>('all');
  const [sortMode, setSortMode] = useState<WishlistSortMode>('createdAt');

  const filtered = useMemo(() => {
    const activeItems = items.filter((item) => !item.isDeleted);
    const searched = searchWishlistItems(activeItems, searchQuery);
    const priorityFiltered = priorityFilter === 'all'
      ? searched
      : searched.filter((item) => item.priority === priorityFilter);
    return [...priorityFiltered].sort(
      sortMode === 'priority' ? compareWishlistByPriority : compareWishlistByCreatedAt,
    );
  }, [items, priorityFilter, searchQuery, sortMode]);

  const hasAnyItems = items.some((item) => !item.isDeleted);

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-ink mb-3">豆愿</h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="mt-3 space-y-2">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`flex-shrink-0 px-2.5 py-1.5 text-xs rounded-lg active:scale-[0.97]
                  transition-all whitespace-nowrap
                  ${priorityFilter === 'all'
                    ? 'bg-surface-cream text-ink font-medium'
                    : 'text-ink-muted hover:bg-surface-card'
                  }`}
              >
                全部优先级
              </button>
              {WISHLIST_PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`flex-shrink-0 px-2.5 py-1.5 text-xs rounded-lg active:scale-[0.97]
                    transition-all whitespace-nowrap
                    ${priorityFilter === opt.value
                      ? 'bg-surface-cream text-ink font-medium'
                      : 'text-ink-muted hover:bg-surface-card'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="inline-flex gap-1 rounded-lg bg-surface-card p-1">
              <button
                onClick={() => setSortMode('createdAt')}
                className={`px-2.5 py-1 text-xs rounded-md active:scale-[0.97] transition-all
                  ${sortMode === 'createdAt' ? 'bg-canvas text-ink font-medium shadow-sm' : 'text-ink-muted'}`}
              >
                加入时间
              </button>
              <button
                onClick={() => setSortMode('priority')}
                className={`px-2.5 py-1 text-xs rounded-md active:scale-[0.97] transition-all
                  ${sortMode === 'priority' ? 'bg-canvas text-ink font-medium shadow-sm' : 'text-ink-muted'}`}
              >
                优先级
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        {!hasAnyItems ? (
          <EmptyState
            onAdd={() => navigate('/wishlist/add')}
            title="还没有豆愿"
            description="记录想买的咖啡豆，买到后可以直接带着已知信息加入豆仓"
            buttonLabel="添加第一条豆愿"
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            没有匹配的豆愿
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/wishlist/add')}
        className="fixed right-4 bottom-20 z-30 w-14 h-14 rounded-full
          bg-primary text-white shadow-lg
          hover:bg-primary-active active:scale-95
          flex items-center justify-center transition-all"
        style={{ boxShadow: '0 4px 20px rgba(204, 120, 92, 0.35)' }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
