# Component Guidelines

> How components are built in this project.

---

## Overview

All components are **React functional components** with TypeScript. Styling is **Tailwind CSS v4** utility classes applied inline. Interactive components use **Radix UI primitives** for accessibility. SVG icons are inlined directly — no icon library.

---

## Component Structure

Every component file follows this pattern:

```tsx
// 1. Imports (external → internal)
import { useNavigate } from 'react-router-dom';
import type { Bean } from '../../types/bean';
import { CATEGORY_LABELS } from '../../constants';

// 2. Props interface
interface BeanCardProps {
  bean: Bean;
  isTrash?: boolean;
}

// 3. Named function export
export function BeanCard({ bean, isTrash }: BeanCardProps) {
  // 4. Hooks at the top
  const navigate = useNavigate();

  // 5. Event handlers (inline or extracted)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ...
  };

  // 6. Derived values / conditional rendering variables
  const statusBadge = (() => { /* ... */ })();

  // 7. JSX return
  return ( /* ... */ );
}
```

---

## Props Conventions

- Define an `interface` named `<Component>Props` directly above the component
- Use `type` imports for prop types from other modules: `import type { Bean } from '../../types/bean'`
- Optional props get `?` marker; provide defaults via destructuring: `({ size = 'md' })`
- Event callbacks use `on<Event>` naming: `onConfirm`, `onOpenChange`, `onTabChange`
- Children are typed as `React.ReactNode` when needed (as in `ToastProvider`, `FormField`)

```tsx
// Standard props pattern
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
}
```

---

## Styling Patterns

- **Tailwind CSS v4** only — no CSS modules, no styled-components
- Custom design tokens from `DESIGN.md` are mapped to Tailwind utility classes (e.g., `bg-canvas`, `text-primary`, `border-hairline`)
- **State variants** use conditional className strings:
  ```tsx
  className={`px-4 py-2 rounded-lg ${variant === 'danger' ? 'bg-error' : 'bg-primary'}`}
  ```
- **Active states**: always include `active:scale-[0.97]` or `active:scale-[0.98]` on interactive elements
- **Hover states**: `hover:bg-*`, `hover:border-*`, `hover:shadow-sm`
- **Transitions**: `transition-all` or `transition-colors` on interactive elements
- **Responsive**: mobile-first, `max-w-lg` containers, `safe-bottom` padding for notched devices
- **Scrollable areas**: `overflow-x-auto scrollbar-hide` for horizontal scroll containers
- **Glass effect headers**: `bg-canvas/95 backdrop-blur-sm` for sticky headers
- **Shadow**: FAB uses explicit `boxShadow` style; cards use `shadow-sm` on hover

---

## Component Communication

- **Parent → Child**: Props (preferred)
- **Shared state**: Zustand store selectors (see `state-management.md`)
- **Cross-cutting concerns**: React Context (only `ToastContext` currently)
- **Navigation**: `useNavigate()` from react-router-dom
- **URL params**: `useParams()` from react-router-dom

---

## Accessibility

- Radix UI primitives (`AlertDialog`, `Dialog`, `Select`, `Tabs`, `Toast`) provide built-in a11y
- All interactive elements are `<button>` elements (not `<div onClick>`)
- Form inputs have associated `<label>` elements
- SVG icons are decorative — no `aria-label` needed on inline SVGs
- Color contrast uses design token pairs (e.g., `text-primary` on white, `text-white` on `bg-primary`)

---

## Common Mistakes

- **Don't use `<div onClick>` for clickable elements** — use `<button>` with Tailwind styling instead
- **Don't forget `e.stopPropagation()`** when a button is inside a clickable card (see `BeanCard.tsx:22`)
- **Don't extract one-off sub-components to `components/ui/`** — keep them as private functions in the page file until they're reused across 2+ pages
- **Don't use `any` for event handlers** — use `React.MouseEvent`, `React.KeyboardEvent`, `React.ChangeEvent<HTMLInputElement>`, etc.