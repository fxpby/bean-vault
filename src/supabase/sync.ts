import { supabase } from './client';
import type { Bean } from '../types/bean';

const TABLE = 'beans';

/** Fetch all beans for the current user from Supabase */
export async function fetchRemoteBeans(): Promise<Bean[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[sync] fetchRemoteBeans error:', error.message);
    return [];
  }

  return (data || []).map(rowToBean);
}

/** Create a bean in Supabase */
export async function createRemoteBean(bean: Bean): Promise<boolean> {
  const row = await beanToRow(bean);
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    console.error('[sync] createRemoteBean error:', error.message);
    return false;
  }
  return true;
}

/** Update a bean in Supabase */
export async function updateRemoteBean(bean: Bean): Promise<boolean> {
  const row = await beanToRow(bean);
  const { error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', bean.id);

  if (error) {
    console.error('[sync] updateRemoteBean error:', error.message);
    return false;
  }
  return true;
}

/** Soft-delete a bean in Supabase */
export async function deleteRemoteBean(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[sync] deleteRemoteBean error:', error.message);
    return false;
  }
  return true;
}

/** Hard-delete a bean in Supabase */
export async function permanentlyDeleteRemoteBean(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) {
    console.error('[sync] permanentlyDeleteRemoteBean error:', error.message);
    return false;
  }
  return true;
}

/** Get current Supabase user ID */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Check if user is logged in */
export async function isLoggedIn(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return userId !== null;
}

// -- Row conversion helpers --

interface BeanRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  status: string;
  country: string;
  country_code: string | null;
  estate: string;
  variety: string;
  process: string;
  roast_level: string;
  flavor_notes: string[];
  price_per_gram: number;
  resting_days: number;
  production_date: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

async function beanToRow(bean: Bean): Promise<BeanRow> {
  const userId = await getCurrentUserId();
  return {
    id: bean.id,
    user_id: userId || '',
    name: bean.name,
    category: bean.category,
    status: bean.status,
    country: bean.country,
    country_code: bean.countryCode ?? null,
    estate: bean.estate,
    variety: bean.variety,
    process: bean.process,
    roast_level: bean.roastLevel,
    flavor_notes: bean.flavorNotes,
    price_per_gram: bean.pricePerGram,
    resting_days: bean.restingDays,
    production_date: bean.productionDate,
    is_deleted: bean.isDeleted,
    created_at: bean.createdAt,
    updated_at: bean.updatedAt,
  };
}

function rowToBean(row: BeanRow): Bean {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Bean['category'],
    status: row.status as Bean['status'],
    country: row.country,
    countryCode: row.country_code ?? undefined,
    estate: row.estate,
    variety: row.variety,
    process: row.process as Bean['process'],
    roastLevel: row.roast_level as Bean['roastLevel'],
    flavorNotes: row.flavor_notes ?? [],
    pricePerGram: row.price_per_gram,
    restingDays: row.resting_days,
    productionDate: row.production_date,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}