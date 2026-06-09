import { supabase } from './client';
import type { WishlistItem } from '../types/bean';
import { getCurrentUserId } from './sync';

const TABLE = 'wishlist_items';

export async function fetchRemoteWishlistItems(): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[wishlist-sync] fetchRemoteWishlistItems error:', error.message);
    return [];
  }

  return (data || []).map(rowToWishlistItem);
}

export async function createRemoteWishlistItem(item: WishlistItem): Promise<boolean> {
  const row = await wishlistItemToRow(item);
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    console.error('[wishlist-sync] createRemoteWishlistItem error:', error.message);
    return false;
  }
  return true;
}

export async function updateRemoteWishlistItem(item: WishlistItem): Promise<boolean> {
  const row = await wishlistItemToRow(item);
  const { error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', item.id);

  if (error) {
    console.error('[wishlist-sync] updateRemoteWishlistItem error:', error.message);
    return false;
  }
  return true;
}

export async function deleteRemoteWishlistItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[wishlist-sync] deleteRemoteWishlistItem error:', error.message);
    return false;
  }
  return true;
}

interface WishlistItemRow {
  id: string;
  user_id: string;
  name: string;
  roaster: string | null;
  country: string;
  country_code: string;
  estate: string | null;
  variety: string | null;
  process: string | null;
  roast_level: string | null;
  flavor_notes: string[];
  price: string | null;
  purchase_url: string | null;
  reason: string | null;
  priority: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

async function wishlistItemToRow(item: WishlistItem): Promise<WishlistItemRow> {
  const userId = await getCurrentUserId();
  return {
    id: item.id,
    user_id: userId || '',
    name: item.name,
    roaster: item.roaster,
    country: item.country,
    country_code: item.countryCode,
    estate: item.estate,
    variety: item.variety,
    process: item.process ?? null,
    roast_level: item.roastLevel ?? null,
    flavor_notes: item.flavorNotes,
    price: item.price,
    purchase_url: item.purchaseUrl,
    reason: item.reason,
    priority: item.priority,
    is_deleted: item.isDeleted,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function rowToWishlistItem(row: WishlistItemRow): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    roaster: row.roaster ?? '',
    country: row.country,
    countryCode: row.country_code,
    estate: row.estate ?? '',
    variety: row.variety ?? '',
    process: row.process ? row.process as WishlistItem['process'] : undefined,
    roastLevel: row.roast_level ? row.roast_level as WishlistItem['roastLevel'] : undefined,
    flavorNotes: row.flavor_notes ?? [],
    price: row.price ?? '',
    purchaseUrl: row.purchase_url ?? '',
    reason: row.reason ?? '',
    priority: row.priority as WishlistItem['priority'],
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
