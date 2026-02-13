# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

**FinSnap** is a client-side-only personal finance tracker. All data lives in `localStorage` — there is no backend API. Zustand stores use `storageGet`/`storageSet` from `src/lib/storage.ts` and are designed with `// TODO: Replace → GET /api/...` comments for future API migration.

### Routing (Next.js App Router)

- `src/app/(auth)/` — login, register (public)
- `src/app/(dashboard)/` — all protected pages: dashboard, wallets, wallets/[id], transactions, budgets, categories, settings
- Dashboard layout (`(dashboard)/layout.tsx`) is a `"use client"` component that checks auth, fetches all store data on mount, and renders sidebar/header/mobile-nav

### State Management (Zustand)

Six stores in `src/stores/`: `auth-store`, `wallet-store`, `transaction-store`, `budget-store`, `category-store`, `ui-store`.

Cross-store access pattern: use `require()` for lazy imports and `useXStore.getState()` to avoid circular dependencies (e.g., budget-store reads from transaction-store).

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
