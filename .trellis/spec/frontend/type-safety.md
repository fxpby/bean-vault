# Type Safety

> Type safety patterns in this project.

---

## Overview

**TypeScript 5.7** with `strict: true`. All project code is fully typed. Types are defined in `src/types/bean.ts` and imported with `import type` for compile-time-only imports.

---

## Type Organization

### Central types file: `src/types/bean.ts`

| Category | TypeScript construct | Examples |
|----------|---------------------|----------|
| Data models | `interface` | `Bean`, `BeanFormData`, `ImportData` |
| Union types | `type` alias | `BeanCategory`, `BeanStatus`, `ProcessMethod`, `RoastLevel`, `SortMode` |
| Lookup helpers | `interface` | `CountryOption` |
| Internal types | `interface` | `SyncQueueItem` |

### Module-scoped types

Types used only within one module are defined in that file:
- `BeanRow` interface in `supabase/sync.ts` (DB row format, not exported)
- `Toast` interface in `components/ui/Toast.tsx` (local to the toast system)
- Props interfaces defined directly above each component

### Type imports

Always use `import type` for type-only imports:

```tsx
import type { Bean, BeanFormData, BeanStatus, SortMode } from '../types/bean';
```

---

## Type Patterns

### Discriminated unions with `type` aliases

String literal unions for finite sets of values:

```tsx
export type BeanStatus = 'shelf' | 'fridge' | 'drinking' | 'finished';
export type RoastLevel = 'ultra-light' | 'light' | 'medium' | 'dark';
```

### Record types for label maps

```tsx
export const STATUS_LABELS: Record<BeanStatus, string> = {
  shelf: '架子上',
  fridge: '冰箱',
  drinking: '正在喝',
  finished: '已喝完',
};
```

### Optional properties with `?`

```tsx
export interface Bean {
  id: string;
  name: string;
  countryCode?: string;  // optional
  // ...
}
```

### Generic update helper (AddBeanPage.tsx:39)

```tsx
const updateField = <K extends keyof BeanFormData>(key: K, value: BeanFormData[K]) => {
  setForm((prev) => ({ ...prev, [key]: value }));
};
```

---

## Type Assertions

Used sparingly, only for **Supabase row casting** where the wire format is known:

```tsx
// supabase/sync.ts — casting snake_case DB rows to camelCase types
category: row.category as Bean['category'],
status: row.status as Bean['status'],
```

Also used for `ImportData` JSON parsing:
```tsx
const data: ImportData = JSON.parse(text);
```

---

## Validation

No runtime validation library (no Zod, Yup, etc.). Validation is:
- **Form-level**: manual checks before submission (`if (!form.name.trim()) { showToast('...', 'error'); return; }`)
- **Date validation**: `isValidDateString()` regex helper in `utils/resting.ts`
- **Import validation**: checks `data.beans` is an array, catch JSON parse errors

---

## Path Aliases

`@/*` maps to `src/*` via `tsconfig.app.json` paths + `vite.config.ts` resolve alias:

```json
// tsconfig.app.json
"paths": { "@/*": ["./src/*"] }
```
```ts
// vite.config.ts
resolve: { alias: { '@': '/src' } }
```

However, the current codebase uses relative imports (`../../types/bean`), not `@/` aliases. Both work — relative imports are the de facto convention.

---

## Forbidden Patterns

| Forbidden | Why | Use instead |
|-----------|-----|-------------|
| `any` | Defeats type checking | `unknown` (see `onAuthStateChange` callback) |
| `as` casts (outside DB mapping) | Silent type lies | Proper type narrowing |
| `@ts-ignore` / `@ts-expect-error` | Hides real issues | Fix the type error |
| `interface` for union types | Not how TS works | `type` alias |
| Default exports for types | Inconsistent | Named exports |
| Inline type definitions in props | Clutter | `interface XProps` above component |

---

## Common Mistakes

- **Forgetting `import type`** — runtime imports work but waste bundler effort; always `import type` for types
- **Using `any` for callbacks** — the Supabase auth callback uses `unknown` for `session`; follow that pattern
- **Not providing default values for optional props** — destructure with defaults: `({ size = 'md' })`