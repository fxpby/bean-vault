<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BeanVault (豆仓) is a mobile-first PWA for coffee enthusiasts to manage their coffee bean inventory. The core feature is automatic resting-period calculation — tracking when each bag of beans is optimally rested and ready to brew.

## Tech Stack

- **Frontend**: React 18+ with TypeScript, Vite 5+
- **Routing**: React Router v7
- **State Management**: Zustand with `persist` middleware (backed by localforage → IndexedDB)
- **UI**: Tailwind CSS (design tokens from `DESIGN.md`) + Radix UI primitives
- **PWA**: `vite-plugin-pwa` (Workbox-based Service Worker generation)
- **Backend**: Supabase (Auth + PostgreSQL + Row Level Security)
- **Auth**: Email OTP verification code (Supabase `signInWithOtp`)
- **Testing**: Vitest (unit), React Testing Library (component), Playwright (E2E, optional)

## Domain Model

### Bean statuses (4 explicit values)

| Status | Meaning |
|--------|---------|
| `shelf` | On the shelf, not yet drinking |
| `fridge` | In the fridge (freezer storage) |
| `drinking` | Manually marked as currently drinking |
| `finished` | Done drinking |

There is no implicit "drinking" status — it must be explicitly set by the user. The "正在喝" tab filters `status === 'drinking'` directly.

### Resting calculation (frontend-derived, not stored)

- `restedDate = productionDate + restingDays`
- `isRested = today >= restedDate`
- `daysUntilRested = isRested ? 0 : (restedDate - today)`

When `isRested && status === 'shelf'`, the card shows a "开始喝" quick-action button.

### Soft delete

Both local and cloud use `isDeleted: true`. The recycle bin is a 6th tab on the homepage. Deleting requires a centered AlertDialog confirmation.

## Architecture

```
Supabase (Auth + DB)
    ↕ sync (updatedAt-based last-write-wins)
Zustand Store (persisted via localforage)
    ↕ reactive
React Components (Tailwind + Radix)
```

- **Data flows**: Supabase ↔ Zustand (bidirectional sync) → UI (read-only selector)
- **Offline**: All writes go to IndexedDB first; sync queue retries on reconnect
- **Sort persistence**: `sortMode` stored in Zustand persist (survives page reload)

## Key Design Decisions

- **Bottom nav**: 2 items only (豆仓 + 设置). Add bean via FAB, search inline at top of home.
- **Homepage tabs**: 全部 / 正在喝 / 架子上 / 冰箱 / 已喝完 / 回收站 (6 tabs)
- **Search**: Immediate filtering, no debounce (data is in-memory, < 200 records)
- **Import/export**: JSON format `{ version: 1, beans: [...] }`. Import offers merge-vs-replace dialog.
- **Country list**: Hardcoded 30-50 common coffee-producing countries with ISO codes and flag emoji
- **Flavor notes**: Preset 20-30 word vocabulary from SCA flavor wheel with autocomplete + free input
- **Roast levels**: 极浅烘 / 浅烘 / 浅中烘 / 中烘 / 中深烘 / 深烘
- **Process methods**: 日晒 / 水洗 / 蜜处理 / 厌氧发酵 / 脱因 / 其他
- **Toast feedback**: All success/failure operations show toast notifications
- **Offline indicator**: Top yellow banner when offline
- **Empty state**: Illustration + guide text + prominent add button for first-time users

## Project Setup

This is a greenfield project. To initialize:

```bash
npm create vite@latest . -- --template react-ts
npm install react-router-dom zustand localforage @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast
```

Map `DESIGN.md` design tokens to `tailwind.config.ts` extensions (colors, fontFamily, fontSize).

## Reference Documents

- `PRD.md` — full product requirements document with all decisions
- `DESIGN.md` — design tokens (colors, typography, component specs)
- `demo1.md` / `demo2.md` — original requirement drafts
