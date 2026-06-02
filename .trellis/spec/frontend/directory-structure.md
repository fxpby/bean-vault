# Directory Structure

> How frontend code is organized in this project.

---

## Overview

This is a single-page React PWA. All source code lives under `src/`. The structure follows a **layer-based** organization: pages compose components, components use hooks, hooks read from the store, the store syncs with Supabase.

---

## Directory Layout

```
src/
├── main.tsx                    # ReactDOM entry point
├── App.tsx                     # Router + global providers (ToastProvider, AppShell)
├── index.css                   # Tailwind imports + global styles
├── vite-env.d.ts               # Vite type declarations
│
├── types/                      # Shared TypeScript interfaces & types
│   └── bean.ts                 # Bean, BeanFormData, enums, sync queue types
│
├── constants/                  # Static lookup data
│   └── index.ts                # Countries, labels, flavor suggestions
│
├── store/                      # Zustand global state
│   └── beanStore.ts            # Single store: beans, sort, sync queue
│
├── hooks/                      # Custom React hooks
│   ├── useFilteredBeans.ts     # Filter + sort derived state
│   ├── useOnlineStatus.ts      # Browser online/offline listener
│   └── useSync.ts              # Supabase sync lifecycle
│
├── utils/                      # Pure utility functions
│   └── resting.ts              # Date math, sort comparators, filter logic
│
├── supabase/                   # Supabase client + sync operations
│   ├── client.ts               # createClient, auth functions
│   └── sync.ts                 # CRUD + row<->bean mapping
│
├── components/
│   ├── bean/                   # Domain-specific components
│   │   ├── BeanCard.tsx        # Bean list item card
│   │   └── RestingBadge.tsx    # Resting status pill
│   ├── layout/                 # App shell components
│   │   ├── BottomNav.tsx       # 2-tab bottom navigation
│   │   ├── TabBar.tsx          # Homepage 6-tab filter bar
│   │   └── OfflineBanner.tsx   # Offline status banner
│   └── ui/                     # Reusable generic components
│       ├── ConfirmDialog.tsx   # AlertDialog wrapper (Radix)
│       ├── EmptyState.tsx      # First-time empty illustration
│       ├── SearchBar.tsx       # Search input with clear
│       └── Toast.tsx           # Toast notification system
│
└── pages/                      # Route-level page components
    ├── HomePage.tsx            # Main bean list with tabs/filters/FAB
    ├── AddBeanPage.tsx         # Add new bean form
    ├── BeanDetailPage.tsx      # Bean detail with edit/delete
    └── SettingsPage.tsx        # Export/import, auth, about
```

---

## Module Organization

- **New features** follow the same layers: add types → add store actions → add hooks → add components → add page
- **Reusable components** go in `components/ui/`
- **Domain-specific components** go in `components/<domain>/` (e.g., `components/bean/`)
- **Layout components** (nav, tabs, banners) go in `components/layout/`
- **One-off sub-components** (e.g., `FormField`, `DetailRow`, `SettingsRow`) are defined as private functions in the same page file — do NOT extract to `components/ui/` unless they're used by 2+ pages

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Page files | `<Name>Page.tsx` | `HomePage.tsx`, `AddBeanPage.tsx` |
| Page components | `<Name>Page` | `export function HomePage()` |
| UI components | `<Name>.tsx` | `SearchBar.tsx`, `EmptyState.tsx` |
| Component exports | Named function exports | `export function BeanCard()` |
| Props interfaces | `<Component>Props` | `interface BeanCardProps` |
| Hook files | `use<Name>.ts` | `useFilteredBeans.ts` |
| Hook functions | `use<Name>` | `export function useFilteredBeans()` |
| Type files | `<domain>.ts` | `bean.ts` |
| Store files | `<domain>Store.ts` | `beanStore.ts` |

---

## Examples

- Well-organized page: `src/pages/HomePage.tsx` — composes `TabBar`, `SearchBar`, `BeanCard`, `EmptyState`, FAB
- Well-organized component: `src/components/bean/BeanCard.tsx` — self-contained with actions, badges, navigation
- Clean hook pattern: `src/hooks/useFilteredBeans.ts` — reads store + local state, returns derived data