# Hook Guidelines

> How hooks are used in this project.

---

## Overview

Custom hooks encapsulate reusable stateful logic. This project has 3 custom hooks. There is no external data-fetching library (no React Query/SWR) — data fetching is handled internally by the Zustand store.

---

## Custom Hook Patterns

### Selector-based store access

All hooks read from the Zustand store using **atomic selectors** — never destructure the entire store:

```tsx
// Correct — single-value selector
const beans = useBeanStore((s) => s.beans);
const setOnline = useBeanStore((s) => s.setOnline);

// Wrong — destructures everything, causes unnecessary re-renders
const { beans, sortMode, setOnline } = useBeanStore();
```

### useEffect for side effects

Hooks manage side effects (event listeners, sync) via `useEffect` with proper cleanup:

```tsx
// Pattern from useOnlineStatus.ts
useEffect(() => {
  const handleOnline = () => setOnline(true);
  const handleOffline = () => setOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [setOnline]);
```

### useRef for once-only guards

For initialization that should only run once, use `useRef` as a gate:

```tsx
// Pattern from useSync.ts
const hasSynced = useRef(false);
useEffect(() => {
  if (hasSynced.current) return;
  hasSynced.current = true;
  // ... one-time init
}, []);
```

---

## Existing Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useFilteredBeans` | `hooks/useFilteredBeans.ts` | Tab filtering, search, category/country filter, sort — returns derived bean list + filter state |
| `useOnlineStatus` | `hooks/useOnlineStatus.ts` | Browser `online`/`offline` events → store `isOnline` |
| `useSyncOnStartup` | `hooks/useSync.ts` | Initial Supabase sync + auth state change listener |

---

## Data Fetching

There is **no dedicated data-fetching library**. All remote data operations go through the Zustand store:

- `store/beanStore.ts` contains `syncFromRemote()` — fetches from Supabase, merges with local
- `supabase/sync.ts` contains the actual Supabase query functions
- `hooks/useSync.ts` triggers initial sync on app mount and after login

---

## Naming Conventions

| Rule | Example |
|------|---------|
| Hook files: `use<Name>.ts` | `useFilteredBeans.ts`, `useOnlineStatus.ts` |
| Hook functions: `use<Name>` | `useFilteredBeans()`, `useOnlineStatus()` |
| Event handlers in hooks: `handle<Event>` | `handleOnline`, `handleOffline` |

---

## When to Create a Hook

1. Logic is used by 2+ components
2. Logic involves `useEffect` / `useState` and is non-trivial
3. Logic reads from the store and derives computed values (memoization)
4. Logic manages browser API subscriptions (online, visibility, etc.)

Do NOT create a hook for:
- Single-use logic that lives comfortably in a component
- Simple store selector calls — use `useBeanStore((s) => s.x)` directly in the component

---

## Common Mistakes

- **Don't forget the dependency array** in `useEffect` / `useCallback` / `useMemo`
- **Don't destructure the whole store** — use selectors to avoid re-renders
- **Don't forget cleanup** in `useEffect` (event listeners, subscriptions, timers)
- **Don't put `useState` init logic** (like `useState(() => { getSession()... })`) in useState — it's a pattern used in `SettingsPage.tsx:103` but is actually a bug; use `useEffect` for side-effect initialization