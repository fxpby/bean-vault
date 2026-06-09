# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

This project uses **Supabase** which provides a **PostgreSQL** database. The client library is `@supabase/supabase-js`. There is no ORM — queries use the Supabase JS client's query builder. Migrations are managed via the Supabase CLI.

---

## Table Schema

### `beans` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK) | UUID v4 from client |
| `user_id` | `uuid` (FK -> auth.users) | For RLS |
| `name` | `text` | NOT NULL |
| `category` | `text` | 'pourover' / 'espresso' / 'subscription' |
| `status` | `text` | 'shelf' / 'fridge' / 'drinking' / 'finished' |
| `country` | `text` | Country name in Chinese |
| `country_code` | `text` | ISO 3166-1 alpha-2, nullable |
| `estate` | `text` | Estate/farm name |
| `variety` | `text` | Coffee variety |
| `process` | `text` | 'washed' / 'natural' / 'honey' / 'anaerobic' / 'decaf' / 'other' |
| `roast_level` | `text` | 'ultra-light' / 'light' / 'light-medium' / 'medium' / 'medium-dark' / 'dark' |
| `flavor_notes` | `text[]` | Array of flavor tags |
| `price_per_gram` | `numeric` | Price per gram in CNY |
| `resting_days` | `integer` | Days needed to rest |
| `production_date` | `date` | Serialized to the frontend as YYYY-MM-DD |
| `notes` | `text` | Free-form bean notes |
| `is_deleted` | `boolean` | Soft delete flag |
| `created_at` | `timestamptz` | ISO 8601 |
| `updated_at` | `timestamptz` | ISO 8601, used for sync conflict resolution |

### `wishlist_items` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK) | UUID v4 from client |
| `user_id` | `uuid` (FK -> auth.users) | Defaults to `auth.uid()`, used for RLS |
| `name` | `text` | NOT NULL |
| `roaster` | `text` | Optional shop/roaster text, defaults to empty string |
| `country` | `text` | Country name selected by the UI |
| `country_code` | `text` | ISO 3166-1 alpha-2 from the country selector |
| `estate` | `text` | Estate/region; UI label is "estate/region" |
| `variety` | `text` | Coffee variety |
| `process` | `text` | Nullable; same values as `beans.process` |
| `roast_level` | `text` | Nullable; same values as `beans.roast_level` |
| `flavor_notes` | `text[]` | Array of flavor tags |
| `price` | `text` | Free-form price text |
| `purchase_url` | `text` | Optional purchase link |
| `reason` | `text` | Optional wishlist reason/notes |
| `priority` | `text` | 'low' / 'normal' / 'high' / 'must' |
| `is_deleted` | `boolean` | Soft delete flag |
| `created_at` | `timestamptz` | ISO 8601 |
| `updated_at` | `timestamptz` | ISO 8601, used for sync conflict resolution |

### Naming conventions

- **Tables**: `snake_case`, plural noun (`beans`)
- **Columns**: `snake_case` (PostgreSQL convention)
- **Enums**: stored as `text` columns (not Postgres enums) for flexibility
- **Timestamps**: `snake_case` suffix `_at` (`created_at`, `updated_at`)
- **Booleans**: `snake_case` prefix `is_` (`is_deleted`)

---

## Query Patterns

### SELECT

```ts
const { data, error } = await supabase
  .from(TABLE)
  .select('*')
  .order('updated_at', { ascending: false });

if (error) {
  console.error('[sync] fetchRemoteBeans error:', error.message);
  return [];
}
return (data || []).map(rowToBean);
```

### INSERT

```ts
const { error } = await supabase.from(TABLE).insert(row);
if (error) {
  console.error('[sync] createRemoteBean error:', error.message);
  return false;
}
return true;
```

### UPDATE

```ts
const { error } = await supabase
  .from(TABLE)
  .update(row)
  .eq('id', bean.id);
```

### DELETE (soft)

```ts
await supabase
  .from(TABLE)
  .update({ is_deleted: true, updated_at: new Date().toISOString() })
  .eq('id', id);
```

### DELETE (hard)

```ts
await supabase.from(TABLE).delete().eq('id', id);
```

---

## Row-Level Security (RLS)

RLS is enabled on every user-owned table (`beans`, `wishlist_items`). Each row is scoped to `auth.uid()`. Users can only access their own rows. The `user_id` column is populated from `getCurrentUserId()` which reads `supabase.auth.getSession()`, and migrations should also default `user_id` to `auth.uid()`.

---

## Row Conversion

Column names use `snake_case` in PostgreSQL but `camelCase` in TypeScript. Converter functions bridge this gap:

- **`beanToRow(bean: Bean)`**: TypeScript camelCase → DB snake_case (for INSERT/UPDATE)
- **`rowToBean(row: BeanRow)`**: DB snake_case → TypeScript camelCase (for SELECT results)
- **`wishlistItemToRow(item: WishlistItem)`**: TypeScript camelCase → DB snake_case, with optional fields converted to nullable DB fields
- **`rowToWishlistItem(row: WishlistItemRow)`**: DB snake_case → TypeScript camelCase, with nullable optional fields converted to `undefined` or empty UI strings as appropriate

The row interfaces are **module-private** in their sync modules (`sync.ts`, `wishlistSync.ts`) — they are not exported.

---

## Migrations

Migrations are managed via the Supabase CLI:
- `supabase/migrations/001_create_beans.sql` creates `beans`
- `supabase/migrations/002_add_bean_notes.sql` backfills the `notes` column for existing deployments
- `supabase/migrations/003_create_wishlist_items.sql` creates `wishlist_items`
- Add migrations with: `supabase migration new <name>`

## Scenario: New Synced Supabase Table

### 1. Scope / Trigger

Use this pattern when a new local-first domain model needs cloud sync. Example: wishlist items are not owned beans, so they require a `wishlist_items` table with its own RLS, row conversion, and sync helper instead of reusing the `beans` table.

### 2. Signatures

Migration files must define:

```sql
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  process TEXT,
  roast_level TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
```

Sync helpers must expose CRUD-shaped functions:

```ts
fetchRemoteWishlistItems(): Promise<WishlistItem[]>
createRemoteWishlistItem(item: WishlistItem): Promise<boolean>
updateRemoteWishlistItem(item: WishlistItem): Promise<boolean>
deleteRemoteWishlistItem(id: string): Promise<boolean>
```

### 3. Contracts

- Table name: plural `snake_case`, e.g. `wishlist_items`.
- Ownership: include `user_id UUID NOT NULL DEFAULT auth.uid()` and RLS policies for SELECT/INSERT/UPDATE/DELETE.
- IDs: client-generated UUID strings map to PostgreSQL `uuid`.
- Deletes: the app's default delete action updates `is_deleted = true` and `updated_at = now`.
- Optional unknown values: nullable DB fields map to optional TypeScript fields. Do not persist a real enum value just because the UI control has a default elsewhere.
- Sync ordering: fetch queries order by `updated_at DESC`.
- Errors: Supabase errors are logged with a domain prefix and helpers return `false` or `[]`, leaving retry behavior to the store.

### 4. Validation & Error Matrix

| Condition | Expected behavior |
|-----------|-------------------|
| Insert/update without matching `auth.uid()` | RLS rejects the write |
| User is not logged in | `getCurrentUserId()` returns `null`; caller should skip remote sync before writing |
| SELECT fails | Log error and return `[]` |
| INSERT/UPDATE soft delete fails | Log error and return `false` |
| Remote nullable `process` / `roast_level` | Convert to `undefined` in the domain model |
| Missing `is_deleted` filtering in UI | Treat as UI/store bug; sync still preserves soft-deleted rows |

### 5. Good/Base/Bad Cases

- Good: `wishlist_items.process` is nullable because users may not know the process before purchase.
- Base: creating a wishlist item inserts a row with `user_id`, timestamps, and `is_deleted = false`.
- Bad: using a Postgres enum for priority or roast level makes future vocabulary changes require enum migrations.

### 6. Tests Required

- Migration review: table has indexes on `user_id` and `updated_at`, RLS enabled, and all four policies present.
- Converter tests: snake_case/camelCase mapping covers every column and optional nullable fields.
- Sync tests: CRUD helpers return `false`/`[]` on Supabase errors and do not throw into UI code.
- Integration tests: local soft delete updates the remote row instead of hard-deleting it.

### 7. Wrong vs Correct

#### Wrong

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### Correct

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
```

---

## Common Mistakes

- **Don't use Postgres ENUM types** — use `text` columns; changing enums requires migrations
- **Don't forget RLS** — every table must have RLS policies for `auth.uid()`
- **Don't store dates as timestamps without timezone** — use `timestamptz` or `text` in YYYY-MM-DD
- **Don't hard-delete by default** — use `is_deleted: true` as the primary delete pattern; hard delete is a separate explicit action
- **Don't use `user_id` from client input** — always get it from `supabase.auth.getSession()` server-side or via RLS
- **Don't add a synced table without converters** — every snake_case column needs an explicit camelCase mapping in the matching sync module
