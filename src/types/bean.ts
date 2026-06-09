export interface Bean {
  id: string;
  name: string;
  category: BeanCategory;
  status: BeanStatus;
  country: string;
  countryCode?: string;
  estate: string;
  variety: string;
  process: ProcessMethod;
  roastLevel: RoastLevel;
  flavorNotes: string[];
  pricePerGram: number;
  restingDays: number;
  productionDate: string; // YYYY-MM-DD
  notes: string;
  isDeleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type BeanCategory = 'pourover' | 'espresso' | 'subscription';

export type BeanStatus = 'shelf' | 'fridge' | 'drinking' | 'finished';

export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'decaf' | 'other';

export type RoastLevel = 'ultra-light' | 'light' | 'light-medium' | 'medium' | 'medium-dark' | 'dark';

export type SortMode = 'default' | 'productionDate' | 'resting';

export type WishlistPriority = 'low' | 'normal' | 'high' | 'must';

export interface BeanFormData {
  name: string;
  category: BeanCategory;
  status: BeanStatus;
  country: string;
  countryCode: string;
  estate: string;
  variety: string;
  process: ProcessMethod;
  roastLevel: RoastLevel;
  flavorNotes: string[];
  pricePerGram: number;
  restingDays: number;
  productionDate: string;
  notes: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  roaster: string;
  country: string;
  countryCode: string;
  estate: string;
  variety: string;
  process?: ProcessMethod;
  roastLevel?: RoastLevel;
  flavorNotes: string[];
  price: string;
  purchaseUrl: string;
  reason: string;
  priority: WishlistPriority;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistFormData {
  name: string;
  roaster: string;
  country: string;
  countryCode: string;
  estate: string;
  variety: string;
  process?: ProcessMethod;
  roastLevel?: RoastLevel;
  flavorNotes: string[];
  price: string;
  purchaseUrl: string;
  reason: string;
  priority: WishlistPriority;
}

export interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

export interface ImportData {
  version: number;
  beans: Bean[];
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  beanId: string;
  data?: Partial<Bean>;
  timestamp: number;
}

export interface WishlistSyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  itemId: string;
  data?: Partial<WishlistItem>;
  timestamp: number;
}

export interface MergeInfo {
  localTotal: number;
  localDeleted: number;
  remoteTotal: number;
  remoteDeleted: number;
  // 暂存云端数据，等用户选择后再 merge
  remoteBeans: Bean[];
}

export type MergeStrategy = 'local' | 'remote' | 'merge';
