# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Maintaining This File

**IMPORTANT:** Update this file whenever you make architectural changes or establish new patterns. Examples of when to update:

- **State management changes:** New stores, middleware changes, data flow patterns
- **Architecture decisions:** Moving from localStorage to API, changing routing structure, new auth flow
- **New conventions:** Naming patterns, folder structure, coding standards
- **Tool/library changes:** Switching validation libraries, updating form handling, new UI patterns
- **Build/dev workflow:** New commands, environment setup, deployment steps

**When in doubt, update it.** This file is the single source of truth for Claude Code to understand the project correctly. Outdated documentation leads to incorrect implementations.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

**FinSnap** is a client-side-only personal finance tracker. All data lives in `localStorage` — there is no backend API. Zustand stores use the `persist` middleware for automatic localStorage sync and are designed with `// TODO: Replace → GET /api/...` comments for future API migration.

### Routing (Next.js App Router)

- `src/app/(auth)/` — login, register (public)
- `src/app/(dashboard)/` — all protected pages: dashboard, wallets, wallets/[id], transactions, budgets, categories, settings
- Dashboard layout (`(dashboard)/layout.tsx`) is a `"use client"` component that checks auth, fetches all store data on mount, and renders sidebar/header/mobile-nav

### State Management (Zustand)

Eight stores in `src/stores/`: `auth-store`, `wallet-store`, `transaction-store`, `budget-store`, `category-store`, `template-store`, `recurring-store`, `debt-store`, `ui-store`.

**Persistence:** All data stores use Zustand's `persist` middleware with:
- `skipHydration: true` (except `auth-store`) — `fetchXxx()` methods call `await useXxxStore.persist.rehydrate()`
- `partialize` to persist only data arrays (e.g., `{ wallets: state.wallets }`)
- No manual `storageGet`/`storageSet` calls — persist middleware auto-writes on `set()`

**Cross-store access:** Top-level ES imports + `useXStore.getState()` inside function bodies (no circular deps).

**Custom hooks:** Computed/derived state extracted to `src/hooks/use-filtered-transactions.ts` and `use-transaction-computed.ts` for memoized selectors used across components.

### Types

All domain types and form input types are in `src/types/index.ts`. Key types: `Wallet`, `Transaction`, `Budget`, `Category`, and their `*FormInput` counterparts.

### Forms & Validation

React Hook Form + Zod v4. Schemas live in `src/lib/validations/` (one per domain). Note: Zod v4 uses `{ message: "..." }` instead of `{ required_error: "..." }` for `z.enum()` and `z.date()`. Use `as any` on `zodResolver()` when `z.coerce.number()` causes type mismatch with `useForm<T>()`.

### Styling & Theming

Tailwind CSS v4 with CSS-based config (no `tailwind.config.ts`). Theme variables defined in `src/app/globals.css` via `@theme`. Seven color themes applied via `data-theme` attribute on `<html>`. Dark mode via `.dark` class. Theme definitions in `src/lib/themes.ts`.

### i18n

Custom translation system in `src/lib/i18n/` with `createT(locale)` returning a `TFunction`. Two locales: `id` (Bahasa Indonesia, default) and `en`. Translation keys typed via `TranslationKey`. Locale persisted in localStorage as `finsnap-locale`.

### Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### UI Components

shadcn/ui components in `src/components/ui/`. Feature components organized by domain: `src/components/{landing,layout,dashboard,wallets,transactions,budgets,categories}/`.

## MCP Tools

Always use **Context7 MCP** (`resolve-library-id` → `query-docs`) when needing library/API documentation, code generation, setup or configuration steps — without the user having to explicitly ask. This applies to any task involving external libraries (e.g., Next.js, Zustand, Zod, React Hook Form, Tailwind CSS, shadcn/ui, etc.).
