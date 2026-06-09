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
  isDeleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type BeanCategory = 'pourover' | 'espresso' | 'subscription';

export type BeanStatus = 'shelf' | 'fridge' | 'drinking' | 'finished';

export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'decaf' | 'other';

export type RoastLevel = 'ultra-light' | 'light' | 'light-medium' | 'medium' | 'medium-dark' | 'dark';

export type SortMode = 'default' | 'productionDate' | 'resting';

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

export interface MergeInfo {
  localTotal: number;
  localDeleted: number;
  remoteTotal: number;
  remoteDeleted: number;
  // 暂存云端数据，等用户选择后再 merge
  remoteBeans: Bean[];
}

export type MergeStrategy = 'local' | 'remote' | 'merge';
