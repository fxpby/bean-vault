# Error Handling

> How errors are handled in this project.

---

## Overview

This project has **no traditional backend** — error handling is split between:
1. **Supabase client errors** (network, auth, database) — handled in `src/supabase/sync.ts` and `src/store/beanStore.ts`
2. **Frontend input validation errors** — handled in page components before calling store actions

There are no custom error classes or error types.

---

## Supabase Error Handling

All Supabase operations follow the same pattern:

```ts
const { data, error } = await supabase.from(TABLE).select('*');

if (error) {
  console.error('[sync] fetchRemoteBeans error:', error.message);
  return [];  // safe default
}

return (data || []).map(rowToBean);
```

**Rules**:
- Destructure `{ data, error }` from every Supabase call
- Check `error` first, return a safe default (empty array, `false`)
- Log errors with `console.error` using a `[sync]` prefix for filtering
- CRUD functions return `boolean` for success/failure (not throwing)
- Calling code in `beanStore.ts` catches errors and queues failed operations for retry

---

## Auth Error Handling

Auth functions return structured results instead of throwing:

```ts
// client.ts
export async function signInWithOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

- `signInWithOtp` returns `{ success, error? }`
- `verifyOtp` and `signOut` return the raw Supabase response (caller checks `error` property)
- `getCurrentUserId` returns `null` when no session (not an error state)

---

## Sync Error Handling & Retry

The sync layer in `beanStore.ts` uses a **queue-based retry** pattern:

```
Operation fails
  → logged with console.error
  → added to syncQueue[]
  → retried when isOnline becomes true (via processSyncQueue)
  → items removed from queue on success
  → on failure, breaks queue processing (will retry next time isOnline changes)
```

Key code from `beanStore.ts:353`:
```ts
} catch {
  // Will retry next time
  break;
}
```

Failed items **stay in the queue** (not removed) so they retry on the next trigger.

---

## Frontend Validation Errors

Form validation is done manually in page components before calling store actions:

```tsx
const handleSubmit = () => {
  if (!form.name.trim()) {
    showToast('请输入豆子名称', 'error');
    return;
  }
  if (!form.country.trim()) {
    showToast('请选择产国', 'error');
    return;
  }
  addBean(form);
  showToast('添加成功');
  navigate('/');
};
```

- Errors shown via `showToast(message, 'error')`
- Validation is inline and specific — each check produces a specific error message
- No form library (no Formik, React Hook Form)

---

## Network/Offline Handling

- `useOnlineStatus` hook monitors `window.addEventListener('online'/'offline')`
- When offline: store actions queue mutations instead of sending to Supabase
- `OfflineBanner` component shows a yellow banner when offline
- No explicit fetch timeout — relies on Supabase client defaults

---

## Common Mistakes

- **Don't throw from Supabase operations** — return `boolean` or safe defaults; the sync queue handles retries
- **Don't swallow errors silently** — always `console.error` with a meaningful prefix
- **Don't show raw error messages to users** — map to Chinese user-friendly messages via `showToast`