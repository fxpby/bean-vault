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

export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other';

export type RoastLevel = 'ultra-light' | 'light' | 'medium' | 'dark';

export type SortMode = 'productionDate' | 'resting';

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