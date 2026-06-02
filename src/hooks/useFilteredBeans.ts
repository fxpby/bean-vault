import { useMemo, useState } from 'react';
import { useBeanStore } from '../store/beanStore';
import { filterBeans, compareByResting, compareByProductionDate, compareByCreatedAt, isRested } from '../utils/resting';

export function useFilteredBeans() {
  const beans = useBeanStore((s) => s.beans);
  const sortMode = useBeanStore((s) => s.sortMode);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = filterBeans(beans, activeTab, searchQuery, categoryFilter, countryFilter);

    // "可以喝了" sort mode: only show rested beans
    if (sortMode === 'resting') {
      result = result.filter((b) => isRested(b.productionDate, b.restingDays));
    }

    const sorter =
      sortMode === 'resting' ? compareByResting :
      sortMode === 'productionDate' ? compareByProductionDate :
      compareByCreatedAt;
    return [...result].sort(sorter);
  }, [beans, activeTab, searchQuery, categoryFilter, countryFilter, sortMode]);

  const availableCountries = useMemo(() => {
    const countries = new Set(
      beans.filter((b) => !b.isDeleted).map((b) => b.country).filter(Boolean)
    );
    return Array.from(countries).sort();
  }, [beans]);

  return {
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
    totalCount: beans.filter((b) => !b.isDeleted).length,
    trashCount: beans.filter((b) => b.isDeleted).length,
  };
}