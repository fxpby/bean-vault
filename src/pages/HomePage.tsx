import { useNavigate } from 'react-router-dom';
import { useFilteredBeans } from '../hooks/useFilteredBeans';
import { useBeanStore } from '../store/beanStore';
import { TabBar } from '../components/layout/TabBar';
import { SearchBar } from '../components/ui/SearchBar';
import { BeanCard } from '../components/bean/BeanCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CATEGORY_OPTIONS, COUNTRIES } from '../constants';

export function HomePage() {
  const navigate = useNavigate();
  const sortMode = useBeanStore((s) => s.sortMode);
  const setSortMode = useBeanStore((s) => s.setSortMode);

  const {
    filtered,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    countryFilter,
    setCountryFilter,
    availableCountries,
    totalCount,
    trashCount,
  } = useFilteredBeans();

  const hasAnyBeans = totalCount > 0 || trashCount > 0;

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-ink">豆仓</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortMode(sortMode === 'resting' ? 'productionDate' : 'resting')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-ink-muted
                  rounded-lg hover:bg-surface-card active:scale-[0.97] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="16" y2="6" />
                  <line x1="4" y1="12" x2="12" y2="12" />
                  <line x1="4" y1="18" x2="8" y2="18" />
                </svg>
                {sortMode === 'resting' ? '可以喝了' : '生产日期'}
              </button>
            </div>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filter row */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-card text-ink-muted
              border-0 outline-none appearance-none cursor-pointer flex-shrink-0"
          >
            <option value="all">全部分类</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-card text-ink-muted
              border-0 outline-none appearance-none cursor-pointer flex-shrink-0"
          >
            <option value="all">全部产国</option>
            {availableCountries.map((c) => {
              const country = COUNTRIES.find((co) => co.name === c);
              return (
                <option key={c} value={c}>
                  {country?.flag} {c}
                </option>
              );
            })}
          </select>
        </div>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} trashCount={trashCount} />
      </div>

      {/* Bean list */}
      <div className="px-4 pt-3">
        {!hasAnyBeans ? (
          <EmptyState onAdd={() => navigate('/add')} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            {activeTab === 'trash' ? '回收站为空' : '没有匹配的豆子'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((bean) => (
              <BeanCard key={bean.id} bean={bean} isTrash={activeTab === 'trash'} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add')}
        className="fixed right-4 bottom-20 z-30 w-14 h-14 rounded-full
          bg-primary text-white shadow-lg
          hover:bg-primary-active active:scale-95
          flex items-center justify-center transition-all"
        style={{ boxShadow: '0 4px 20px rgba(204, 120, 92, 0.35)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}