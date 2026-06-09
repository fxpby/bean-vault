import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { useWishlistStore } from '../store/wishlistStore';
import { searchWishlistItems } from '../utils/wishlist';

export function WishlistPage() {
  const navigate = useNavigate();
  const items = useWishlistStore((s) => s.items);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const activeItems = items.filter((item) => !item.isDeleted);
    const searched = searchWishlistItems(activeItems, searchQuery);
    return [...searched].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [items, searchQuery]);

  const hasAnyItems = items.some((item) => !item.isDeleted);

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-ink mb-3">豆愿</h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
