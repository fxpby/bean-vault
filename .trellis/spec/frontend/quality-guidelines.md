# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This project uses **Vite** for building, **TypeScript** for type-checking, **ESLint** for linting, and **Vitest** for testing. Quality is enforced at build time (`tsc -b && vite build`). There is no pre-commit hook currently — lint and type-check run in the build script.

---

## Build & Type Checking

- `npm run build` runs `tsc -b && vite build` — type-check first, then bundle
- `tsconfig.app.json`: `strict: true`, `noFallthroughCasesInSwitch: true`, `noUncheckedSideEffectImports: true`
- `noUnusedLocals: false`, `noUnusedParameters: false` — unused vars are allowed (not enforced)

---

## Linting

- `npm run lint` runs `eslint .`
- ESLint config is at the project root (check `eslint.config.js` or `.eslintrc`)
- No custom rule set documented — uses Vite React-TS defaults

---

## Testing

- **Vitest** (`vitest@^3.0.7`) with `jsdom` environment
- **React Testing Library** (`@testing-library/react@^16.2.0`) for component tests
- Scripts: `npm test` (vitest run), `npm run test:ui` (vitest UI)
- No Playwright/E2E setup currently (listed as optional in CLAUDE.md)

No existing test files found in the codebase — testing is set up but not yet exercised.

---

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| `<div onClick>` as button | Not keyboard-accessible; use `<button>` |
| Inline `style={{}}` objects | Use Tailwind classes; the only exception is `boxShadow` on the FAB |
| `any` type | Defeats TypeScript; use `unknown` |
| `// @ts-ignore` | Hides type errors; fix the underlying issue |
| Index as key (`key={i}`) | Unstable across re-renders; use stable IDs |
| `dangerouslySetInnerHTML` | XSS risk; not used anywhere |
| Direct DOM manipulation | React should own the DOM; `document.createElement` in SettingsPage export is the only exception (creating a download link) |
| CSS `!important` | Not needed with Tailwind utility classes |
| `useEffect` without deps | Causes infinite loops or stale closures |

---

## Required Patterns

| Pattern | Where |
|---------|-------|
| `e.stopPropagation()` | Clickable buttons inside clickable cards |
| `active:scale-[0.97]` or `[0.98]` | All interactive elements (buttons, cards) |
| `transition-all` or `transition-colors` | All interactive elements |
| Cleanup in `useEffect` | Event listeners, timers, subscriptions |
| `useCallback` for Context values | `showToast` in `ToastProvider` |
| `useMemo` for derived data | Computed bean lists in `useFilteredBeans` |
| Error boundaries (implied) | App shell wraps pages; toast shows errors |

---

## Code Review Checklist

- [ ] Props interface defined above component, named `<Component>Props`
- [ ] All interactive elements are `<button>`, not `<div onClick>`
- [ ] `active:scale-[0.97]` on all buttons and clickable cards
- [ ] `e.stopPropagation()` on nested buttons inside clickable containers
- [ ] No `any` types; `unknown` used where type is truly unknown
- [ ] `useEffect` has correct dependency array and cleanup
- [ ] Store selectors are atomic (`useBeanStore((s) => s.x)`) not destructured
- [ ] One-off sub-components stay in page file, not prematurely extracted to `components/ui/`
- [ ] Tailwind classes use project design tokens (`bg-canvas`, `text-primary`, `border-hairline`), not arbitrary colors
- [ ] No inline `style={{}}` except for `boxShadow` on FAB
- [ ] Toast feedback on all user-visible operations (add, update, delete, import, export, auth)