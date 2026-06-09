import type { WishlistFormData, WishlistItem, WishlistPriority } from '../types/bean';

const WISHLIST_PRIORITY_WEIGHT: Record<WishlistPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
  must: 3,
};

export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function searchWishlistItems(items: WishlistItem[], query: string): WishlistItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((item) => {
    const searchable = [
      item.name,
      item.roaster,
      item.country,
      item.estate,
      item.variety,
      item.price,
      item.purchaseUrl,
      item.reason,
      ...item.flavorNotes,
    ].join(' ');
    return searchable.toLowerCase().includes(q);
  });
}

export function compareWishlistByCreatedAt(a: WishlistItem, b: WishlistItem): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function compareWishlistByPriority(a: WishlistItem, b: WishlistItem): number {
  const priorityDiff = WISHLIST_PRIORITY_WEIGHT[b.priority] - WISHLIST_PRIORITY_WEIGHT[a.priority];
  return priorityDiff || compareWishlistByCreatedAt(a, b);
}

export function buildBeanNotesFromWishlist(item: WishlistItem): string {
  return [
    '来源：豆愿',
    item.roaster ? `烘焙商/店铺：${item.roaster}` : '',
    item.price ? `价格：${item.price}` : '',
    item.purchaseUrl ? `购买链接：${item.purchaseUrl}` : '',
    item.reason ? `想买理由：${item.reason}` : '',
  ].filter(Boolean).join('\n');
}

export function wishlistItemToFormData(item: WishlistItem): WishlistFormData {
  return {
    name: item.name,
    roaster: item.roaster,
    country: item.country,
    countryCode: item.countryCode,
    estate: item.estate,
    variety: item.variety,
    process: item.process,
    roastLevel: item.roastLevel,
    flavorNotes: item.flavorNotes,
    price: item.price,
    purchaseUrl: item.purchaseUrl,
    reason: item.reason,
    priority: item.priority,
  };
}
