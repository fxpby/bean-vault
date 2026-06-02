import { useMemo, useState } from 'react';
import { useBeanStore } from '../store/beanStore';
import { filterBeans, compareByResting, compareByProductionDate } from '../utils/resting';

export function useFilteredBeans() {
  const beans = useBeanStore((s) => s.beans);
  const sortMode = useBeanStore((s) => s.sortMode);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const filtered = useMemo(() => {
    const result = filterBeans(beans, activeTab, searchQuery, categoryFilter, countryFilter);
    const sorter = sortMode === 'resting' ? compareByResting : compareByProductionDate;
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