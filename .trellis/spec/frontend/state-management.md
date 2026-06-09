# State Management

> How state is managed in this project.

---

## Overview

**Zustand** is the single global state manager. Persistent domain data lives in domain-scoped stores such as `beanStore.ts` and `wishlistStore.ts`, each using the `persist` middleware backed by **localforage** (IndexedDB). There is no Redux, no Context for global state (only `ToastContext` for the toast notification system).

---

## State Categories

| Category | Where | Example |
|----------|-------|---------|
| **Global persistent** | Zustand + localforage | `beans[]`, `items[]`, `sortMode` |
| **Global ephemeral** | Zustand (not persisted) | `isOnline`, `isSyncing`, `syncQueue[]` |
| **UI local** | `useState` in component | `activeTab`, `searchQuery`, form inputs |
| **URL state** | React Router params | `/bean/:id` → `useParams()` |
| **Context** | React Context | `ToastContext` (showToast) |

---

## Store Architecture

Stores are split by source-of-truth domain, not by screen. A new domain model with its own lifecycle and sync table should get its own store instead of being folded into `beanStore.ts`.

| Store | Persistent data | Persist key | Remote helper |
|-------|-----------------|-------------|---------------|
| `src/store/beanStore.ts` | `beans`, `sortMode` | `bean-vault-store` | `src/supabase/sync.ts` |
| `src/store/wishlistStore.ts` | `items` | `bean-vault-wishlist-store` | `src/supabase/wishlistSync.ts` |

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface DomainStore {
  // State
  items: DomainItem[];
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;

  // Actions
  addItem: (data: DomainFormData) => DomainItem;
  updateItem: (id: string, data: Partial<DomainFormData>) => void;
  deleteItem: (id: string) => void;
  // ...
}

export const useDomainStore = create<DomainStore>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'bean-vault-<domain>-store',
      storage: createJSONStorage(() => localforageStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
```

### Persistence

- **Storage backend**: `localforage` → IndexedDB (handles large JSON better than localStorage)
- **Custom storage adapter** wraps localforage's async API to match Zustand's sync API (`getItem`, `setItem`, `removeItem`)
- **`partialize`** controls what gets persisted. Persist durable domain data (`beans`, `items`, `sortMode`) but never `syncQueue`, `isOnline`, or `isSyncing`

### Store Actions Pattern

Actions use `set()` for immutable state updates and `get()` for reading current state without subscribing:

```tsx
addBean: (data: BeanFormData) => {
  const bean: Bean = { id: uuidv4(), /* ... */ };
  set((state) => ({ beans: [bean, ...state.beans] }));
  syncToRemote('create', bean);  // fire-and-forget async
  return bean;
},
```

### Fire-and-Forget Sync

Store actions trigger remote sync asynchronously **without awaiting**. If offline or not logged in, sync is queued. The sync helper (`syncToRemote`) lives in the same file but **outside** the store — it reads state via `useBeanStore.getState()`.

---

## When to Use Global State

Put data in the Zustand store when:
1. Multiple components across different routes need it (beans, sort preference)
2. It needs to survive page navigation (persisted state)
3. It's the source of truth for sync operations
4. It represents a distinct business lifecycle such as wishlist items vs owned beans

Keep data in local `useState` when:
1. Only one component needs it (form inputs, dropdown open state)
2. It's UI-only transient state (tab selection, search query)
3. It resets on navigation and doesn't need persistence

---

## Derived State

Use `useMemo` in hooks to compute derived data from store state. The pattern from `useFilteredBeans.ts`:

```tsx
const filtered = useMemo(() => {
  const result = filterBeans(beans, activeTab, searchQuery, categoryFilter, countryFilter);
  const sorter = sortMode === 'resting' ? compareByResting : compareByProductionDate;
  return [...result].sort(sorter);
}, [beans, activeTab, searchQuery, categoryFilter, countryFilter, sortMode]);
```

Never store derived data in the store — compute it from source data.

---

## Server State

Supabase is the remote source of truth for each synced domain. The sync model is **last-write-wins** based on `updatedAt`:

1. On app startup: fetch from Supabase for each domain, merge with local (newer `updatedAt` wins)
2. On local mutation: write to local first, then push to Supabase (fire-and-forget)
3. When offline: queue mutations in `syncQueue[]`, retry when `isOnline` becomes true
4. On auth change: trigger full sync

There is no optimistic UI rollback — local is always updated immediately and remote sync is best-effort.

## Scenario: Independent Synced Domain Store

### 1. Scope / Trigger

Use this pattern when adding a persistent domain model that is not a lifecycle state of an existing model. Example: wishlist items are separate from owned beans, so they use `WishlistItem` plus `useWishlistStore` instead of adding a `wishlist` value to `BeanStatus`.

### 2. Signatures

```tsx
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

interface WishlistStore {
  items: WishlistItem[];
  syncQueue: WishlistSyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  addItem: (data: WishlistFormData) => WishlistItem;
  updateItem: (id: string, data: Partial<WishlistFormData>) => void;
  deleteItem: (id: string) => void;
  syncFromRemote: () => Promise<void>;
}
```

Remote helpers should follow the domain naming pattern:

```tsx
fetchRemoteWishlistItems(): Promise<WishlistItem[]>
createRemoteWishlistItem(item: WishlistItem): Promise<boolean>
updateRemoteWishlistItem(item: WishlistItem): Promise<boolean>
deleteRemoteWishlistItem(id: string): Promise<boolean>
```

### 3. Contracts

- Store key: every new store must use a stable unique `persist.name`.
- Local write: `addItem`, `updateItem`, and `deleteItem` update IndexedDB-backed state before remote sync.
- Delete: local delete means `isDeleted: true`; list selectors/pages filter deleted items unless they are explicitly a recycle-bin view.
- Optional fields: optional domain fields remain `undefined` locally and `null` remotely. Do not write fake defaults to represent unknown data.
- Sync queue: queue entries include `id`, `action`, domain id, optional payload, and numeric `timestamp`.
- Auth: if `isLoggedIn()` is false, remote sync exits without queuing because there is no remote owner.
- Conversion: cross-domain conversion should be explicit at route/action boundaries, not implicit store coupling.

### 4. Validation & Error Matrix

| Condition | Expected behavior |
|-----------|-------------------|
| Required UI field missing | Component blocks action and shows toast |
| User is offline | Local state updates, sync queue records the mutation |
| Remote write fails | Keep local state, enqueue retry, log a domain-prefixed error |
| Remote fetch returns older item | Keep local item when local `updatedAt` is newer |
| Remote fetch returns newer item | Replace local item with remote item |
| Source item missing during conversion | Continue the destination flow without prefill |

### 5. Good/Base/Bad Cases

- Good: wishlist item with unknown process stores `process: undefined` locally and `process: null` in Supabase.
- Base: adding a wishlist item inserts it at the top of `items`, then fire-and-forget sync creates the remote row.
- Bad: adding `wishlist` to `BeanStatus` pollutes inventory tabs and resting calculations with not-yet-owned beans.

### 6. Tests Required

- Store unit tests: add/update/delete updates timestamps, sets `isDeleted`, and persists only durable state.
- Sync tests: local-vs-remote merge chooses the newer `updatedAt`; offline writes enqueue retries.
- Route/component tests: conversion route prefills known fields and leaves optional unknown process/roast fields at destination defaults.
- UI tests: deleted wishlist items disappear from list/detail routes after confirmation.

### 7. Wrong vs Correct

#### Wrong

```tsx
type BeanStatus = 'shelf' | 'fridge' | 'drinking' | 'finished' | 'wishlist';
```

#### Correct

```tsx
export interface WishlistItem {
  id: string;
  name: string;
  isDeleted: boolean;
  updatedAt: string;
}

export const useWishlistStore = create<WishlistStore>()(/* own persist + sync */);
```

---

## Common Mistakes

- **Don't store derived values** in the store — use `useMemo` in hooks
- **Don't await sync in actions** — fire-and-forget to keep UI responsive
- **Don't put ephemeral state in `partialize`** — it will bloat persisted storage
- **Don't call `getState()` inside a selector** — it breaks reactivity; use it only in async helpers outside the store
- **Don't model a separate business lifecycle as an enum value** — create a domain model/store when data ownership, forms, sync table, or conversion behavior differs
