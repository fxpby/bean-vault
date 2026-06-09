import type { Bean } from '../types/bean';

export function getRestingDate(productionDate: string, restingDays: number): Date {
  const d = new Date(productionDate + 'T00:00:00');
  d.setDate(d.getDate() + restingDays);
  return d;
}

export function isRested(productionDate: string, restingDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= getRestingDate(productionDate, restingDays);
}

export function getDaysUntilRested(productionDate: string, restingDays: number): number {
  if (isRested(productionDate, restingDays)) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rested = getRestingDate(productionDate, restingDays);
  return Math.ceil((rested.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getRestedDateString(productionDate: string, restingDays: number): string {
  const d = getRestingDate(productionDate, restingDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function compareByResting(a: Bean, b: Bean): number {
  const aRested = isRested(a.productionDate, a.restingDays);
  const bRested = isRested(b.productionDate, b.restingDays);

  if (aRested && !bRested) return -1;
  if (!aRested && bRested) return 1;

  if (aRested && bRested) {
    return new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime();
  }

  const aDays = getDaysUntilRested(a.productionDate, a.restingDays);
  const bDays = getDaysUntilRested(b.productionDate, b.restingDays);
  return aDays - bDays;
}

export function compareByProductionDate(a: Bean, b: Bean): number {
  return new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime();
}

export function compareByCreatedAt(a: Bean, b: Bean): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isValidDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00').getTime());
}

export function searchBeans(beans: Bean[], query: string): Bean[] {
  if (!query.trim()) return beans;
  const q = query.toLowerCase();
  return beans.filter((b) => {
    const searchable = [b.name, b.estate, b.country, b.variety, b.notes ?? '', ...b.flavorNotes].join(' ');
    return searchable.toLowerCase().includes(q);
  });
}

export function filterBeans(
  beans: Bean[],
  tab: string,
  searchQuery: string,
  categoryFilter: string,
  countryFilter: string
): Bean[] {
  let result = beans.filter((b) => !b.isDeleted);

  if (tab === 'trash') {
    result = beans.filter((b) => b.isDeleted);
  } else if (tab !== 'all') {
    result = result.filter((b) => b.status === tab);
  }

  if (categoryFilter && categoryFilter !== 'all') {
    result = result.filter((b) => b.category === categoryFilter);
  }

  if (countryFilter && countryFilter !== 'all') {
    result = result.filter((b) => b.country === countryFilter);
  }

  if (searchQuery.trim()) {
    result = searchBeans(result, searchQuery);
  }

  return result;
}
