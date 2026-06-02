# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

This project's "backend" is **Supabase** (BaaS). Backend code quality focuses on:
1. **Supabase JS client usage** (`src/supabase/`)
2. **Database schema** (RLS policies, migrations, naming)
3. **Sync logic** (`src/store/beanStore.ts` sync helpers)

---

## Supabase Client Patterns

### Required: Single client instance

The Supabase client is created **once** in `src/supabase/client.ts` and exported as a singleton:

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { /* config */ });
```

Never create additional client instances in other files — always import the singleton.

### Required: Error checking on every query

Every Supabase query must check the `error` property:

```ts
const { data, error } = await supabase.from('beans').select('*');
if (error) {
  console.error('[sync] operation error:', error.message);
  return safeDefault;
}
```

### Required: Row conversion layer

All DB operations go through `beanToRow` / `rowToBean` converters. Never expose `snake_case` column names to the rest of the app.

---

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Direct `supabase` usage outside `supabase/` directory | Keep data access centralized; use store actions in components |
| Raw SQL queries (`.rpc()` without review) | Prefer the query builder; RPC only for complex queries reviewed for SQL injection |
| Client-side `user_id` injection | Always get `user_id` from `supabase.auth.getSession()` |
| Hard-delete as default | Use soft delete (`is_deleted: true`); hard delete is explicit and separate |
| Storing `supabase` client in Zustand | The client is stateless (auth is managed by Supabase internals) |
| `any` type for Supabase responses | Use typed interfaces (e.g., `BeanRow`) |

---

## Required Patterns

| Pattern | Where |
|---------|-------|
| `[sync]` prefix on console.error | All sync operation logs |
| Return `boolean` from CRUD functions | `createRemoteBean`, `updateRemoteBean`, etc. |
| Return safe defaults on error | `[]` for fetch, `false` for mutations |
| Row conversion helpers | `beanToRow` / `rowToBean` in `sync.ts` |
| Auth check before sync | `isLoggedIn()` guard in `syncToRemote` |
| Offline queue fallback | `syncQueue` in store when offline or sync fails |

---

## RLS Policy Checklist

- [ ] Every table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policies scope data to `auth.uid()`
- [ ] INSERT policy checks `user_id = auth.uid()`
- [ ] SELECT policy filters by `user_id = auth.uid()`
- [ ] UPDATE/DELETE policies filter by `user_id = auth.uid()`

---

## Sync Logic Quality

From `src/store/beanStore.ts`:

- **Fire-and-forget**: Store actions call `syncToRemote()` without `await` — UI stays responsive
- **Queue on failure**: Failed sync operations are queued in `syncQueue[]` for retry
- **Retry on reconnect**: `processSyncQueue()` runs when `isOnline` flips to `true`
- **Idempotent queue items**: Each item has a unique `id` based on action + beanId + timestamp
- **No infinite retry**: Queue processing breaks on first failure; items stay queued for next trigger

---

## Testing Requirements

- No backend-specific tests currently (Supabase operations are integration-level)
- Store tests should mock `supabase/sync` module functions
- Auth flow tests should mock `supabase/auth` functions

---

## Code Review Checklist

- [ ] Every Supabase call checks `error` property
- [ ] Row conversion uses `beanToRow`/`rowToBean`, not manual mapping
- [ ] New columns: added to both `BeanRow` interface and both converters
- [ ] `user_id` comes from `getCurrentUserId()`, never from client input
- [ ] Errors are logged with `[sync]` or `[auth]` prefix
- [ ] CRUD functions return consistent types (boolean for mutations, array for fetch)
- [ ] RLS policies exist for new tables