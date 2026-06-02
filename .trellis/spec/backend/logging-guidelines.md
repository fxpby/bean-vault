# Logging Guidelines

> How logging is done in this project.

---

## Overview

This project has **no structured logging framework**. Logging is done via `console.error` for errors and `console.log` for debug messages. There is no server-side logging (all backend is Supabase-managed).

---

## Log Levels

| Level | When to Use | Example |
|-------|------------|---------|
| `console.error` | Supabase operations fail, sync errors | `console.error('[sync] fetchRemoteBeans error:', error.message)` |
| `console.log` | (Not currently used in production code) | — |
| `console.warn` | Deprecation or soft issues | (Not currently used) |

---

## Log Format

All sync-related logs use a **`[sync]` prefix** for easy filtering in DevTools:

```
[sync] fetchRemoteBeans error: connection timeout
[sync] createRemoteBean error: duplicate key
[sync] syncToRemote update error: network error
```

Auth logs currently do NOT use a prefix — if adding auth logging, use `[auth]`.

---

## What to Log

- **Supabase operation failures**: always (with error message)
- **Sync failures**: always (logged in `syncToRemote` helper)
- **Auth failures**: when they occur (currently only surface via `showToast`)

---

## What NOT to Log

- **User PII**: emails, user IDs, session tokens — never log these
- **Full bean data**: don't dump entire Bean objects; reference by ID
- **Auth tokens**: never log JWT or session data
- **Passwords**: not applicable (OTP-only auth)
- **Internal state in production**: `syncQueue`, full store state

---

## Browser Console in Production

No production log suppression is currently configured. The PWA uses `console.error` freely. Consider adding a log level guard for production builds if needed.

---

## Common Mistakes

- **Don't log sensitive data** — error messages from Supabase are safe; full row data is not
- **Don't use `console.log` for errors** — use `console.error` so they're filterable in DevTools
- **Don't log in hot loops** — sync operations are infrequent so this isn't a concern currently