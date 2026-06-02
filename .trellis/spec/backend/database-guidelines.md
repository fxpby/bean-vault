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
| `id` | `text` (PK) | UUID v4 from client |
| `user_id` | `text` (FK → auth.users) | For RLS |
| `name` | `text` | NOT NULL |
| `category` | `text` | 'pourover' / 'espresso' / 'subscription' |
| `status` | `text` | 'shelf' / 'fridge' / 'drinking' / 'finished' |
| `country` | `text` | Country name in Chinese |
| `country_code` | `text` | ISO 3166-1 alpha-2, nullable |
| `estate` | `text` | Estate/farm name |
| `variety` | `text` | Coffee variety |
| `process` | `text` | 'washed' / 'natural' / 'honey' / 'anaerobic' / 'other' |
| `roast_level` | `text` | 'ultra-light' / 'light' / 'medium' / 'dark' |
| `flavor_notes` | `text[]` | Array of flavor tags |
| `price_per_gram` | `numeric` | Price per gram in CNY |
| `resting_days` | `integer` | Days needed to rest |
| `production_date` | `text` | YYYY-MM-DD format |
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

RLS is enabled on the `beans` table. Each row is scoped to `auth.uid()`. Users can only access their own beans. The `user_id` column is populated from `getCurrentUserId()` which reads `supabase.auth.getSession()`.

---

## Row Conversion

Column names use `snake_case` in PostgreSQL but `camelCase` in TypeScript. Two converter functions bridge this gap:

- **`beanToRow(bean: Bean)`**: TypeScript camelCase → DB snake_case (for INSERT/UPDATE)
- **`rowToBean(row: BeanRow)`**: DB snake_case → TypeScript camelCase (for SELECT results)

The `BeanRow` interface is **module-private** in `sync.ts` — it's not exported.

---

## Migrations

Migrations are managed via the Supabase CLI:
- `supabase/` directory contains migration files
- No migration files currently in the repo (greenfield project)
- Add migrations with: `supabase migration new <name>`

---

## Common Mistakes

- **Don't use Postgres ENUM types** — use `text` columns; changing enums requires migrations
- **Don't forget RLS** — every table must have RLS policies for `auth.uid()`
- **Don't store dates as timestamps without timezone** — use `timestamptz` or `text` in YYYY-MM-DD
- **Don't hard-delete by default** — use `is_deleted: true` as the primary delete pattern; hard delete is a separate explicit action
- **Don't use `user_id` from client input** — always get it from `supabase.auth.getSession()` server-side or via RLS