# State Management

> How state is managed in this project.

---

## Overview

**Zustand** is the single global state manager. The entire app uses **one store** (`beanStore.ts`) with the `persist` middleware backed by **localforage** (IndexedDB). There is no Redux, no Context for global state (only `ToastContext` for the toast notification system).

---

## State Categories

| Category | Where | Example |
|----------|-------|---------|
| **Global persistent** | Zustand + localforage | `beans[]`, `sortMode` |
| **Global ephemeral** | Zustand (not persisted) | `isOnline`, `isSyncing`, `syncQueue[]` |
| **UI local** | `useState` in component | `activeTab`, `searchQuery`, form inputs |
| **URL state** | React Router params | `/bean/:id` → `useParams()` |
| **Context** | React Context | `ToastContext` (showToast) |

---

## Store Architecture

Single file: `src/store/beanStore.ts`

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface BeanStore {
  // State
  beans: Bean[];
  sortMode: SortMode;
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;

  // Actions
  addBean: (data: BeanFormData) => Bean;
  updateBean: (id: string, data: Partial<BeanFormData>) => void;
  deleteBean: (id: string) => void;
  // ...
}

export const useBeanStore = create<BeanStore>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'bean-vault-store',
      storage: createJSONStorage(() => localforageStorage),
      partialize: (state) => ({
        beans: state.beans,
        sortMode: state.sortMode,
      }),
    }
  )
);
```

### Persistence

- **Storage backend**: `localforage` → IndexedDB (handles large JSON better than localStorage)
- **Custom storage adapter** wraps localforage's async API to match Zustand's sync API (`getItem`, `setItem`, `removeItem`)
- **`partialize`** controls what gets persisted — only `beans` and `sortMode`, NOT `syncQueue`, `isOnline`, `isSyncing`

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

Supabase is the remote source of truth. The sync model is **last-write-wins** based on `updatedAt`:

1. On app startup: fetch from Supabase, merge with local (newer `updatedAt` wins)
2. On local mutation: write to local first, then push to Supabase (fire-and-forget)
3. When offline: queue mutations in `syncQueue[]`, retry when `isOnline` becomes true
4. On auth change: trigger full sync

There is no optimistic UI rollback — local is always updated immediately and remote sync is best-effort.

---

## Common Mistakes

- **Don't store derived values** in the store — use `useMemo` in hooks
- **Don't await sync in actions** — fire-and-forget to keep UI responsive
- **Don't put ephemeral state in `partialize`** — it will bloat persisted storage
- **Don't call `getState()` inside a selector** — it breaks reactivity; use it only in async helpers outside the store