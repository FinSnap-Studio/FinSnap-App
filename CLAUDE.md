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
npm run format   # Format code with Biome
```

**Code formatting:** Biome v2 with double quotes, semicolons, 100-char line width. CSS formatting disabled (conflicts with Tailwind syntax).

No test framework is configured.

## Architecture

**FinSnap** is a client-side-only personal finance tracker. All data lives in `localStorage` — there is no backend API. Zustand stores use the `persist` middleware for automatic localStorage sync and are designed with `// TODO: Replace → GET /api/...` comments for future API migration.

### Routing (Next.js App Router)

- `src/app/(auth)/` — login, register (public)
- `src/app/(dashboard)/` — all protected pages: dashboard, wallets, wallets/[id], transactions, budgets, categories, debts, shopping, shopping/[id], settings
- Dashboard layout (`(dashboard)/layout.tsx`) is a `"use client"` component that checks auth, fetches all store data on mount, and renders sidebar/header/mobile-nav

### State Management (Zustand)

Ten stores in `src/stores/`: `auth-store`, `wallet-store`, `transaction-store`, `budget-store`, `category-store`, `template-store`, `recurring-store`, `debt-store`, `shopping-store`, `ui-store`.

**Persistence:** Nine data stores use Zustand's `persist` middleware. `ui-store` manages its own localStorage keys directly (theme, color-theme, currency, locale) without `persist` middleware.

Data stores use `persist` with:

- `skipHydration: true` (except `auth-store`) — `fetchXxx()` methods call `await useXxxStore.persist.rehydrate()`
- `partialize` to persist only data arrays (e.g., `{ wallets: state.wallets }`)
- **No manual localStorage access** — always use Zustand actions (e.g., `updateProfile` in Settings). Persist middleware auto-writes on `set()`.

**Cross-store access:** Top-level ES imports + `useXStore.getState()` inside function bodies (no circular deps).

**Custom hooks:** Computed/derived state extracted to `src/hooks/use-filtered-transactions.ts` and `use-transaction-computed.ts` for memoized selectors used across components.

**Development tools:** All stores use `devtools` middleware (enabled only in `development` via `process.env.NODE_ENV`) for Redux DevTools integration.

### Shared Constants & Helpers

- **`src/lib/constants.ts`** — `MOCK_USER_ID` (user ID until auth backend exists)
- **`src/lib/transaction-helpers.ts`** — `applyTransactionEffect`, `reverseTransactionEffect`, `resolveTransferFields` (centralized transaction effect logic)
- **`src/lib/nav-icon-map.ts`** — `NAV_ICON_MAP` for i18n-consistent navigation icons
- **`shopping-store`** — `purchaseItem` auto-creates an EXPENSE transaction via `useTransactionStore.getState().addTransaction()` as a side effect

### Performance Patterns

- **Category maps:** Use `useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])` for O(1) lookups instead of O(n) `find()` calls
- **Cached formatters:** Create `Intl.NumberFormat` instances once, reuse across renders (e.g., in `format-currency.ts`)
- **Single-pass hooks:** Compute derived state in one loop (e.g., `useMonthlyTrend` calculates income/expense/net in single reduce)
- **Wrap derived state in `useMemo`:** Prevent recalculation on every render for computed values

### Types

All domain types and form input types are in `src/types/index.ts`. Key types: `Wallet`, `Transaction`, `Budget`, `Category`, and their `*FormInput` counterparts.

### Forms & Validation

React Hook Form + Zod v4. Schemas live in `src/lib/validations/` (one per domain). Use `useWatch({ control: form.control, name })` instead of `form.watch()` for React Compiler compatibility.

**Zod v4 conventions:**

- Use `{ message: "..." }` instead of `{ required_error: "..." }` for `z.enum()` and `z.date()`
- **Transfer refinements:** Shared `.refine()` logic for "from wallet ≠ to wallet" validation in transaction schemas
- **Dynamic year range:** `z.number().min(2000).max(new Date().getFullYear() + 10)` instead of hardcoded years
- **Debt person validation:** `z.string().min(1).max(100)` with custom messages
- Use `as any` on `zodResolver()` when `z.coerce.number()` causes type mismatch with `useForm<T>()`

### Styling & Theming

Tailwind CSS v4 with CSS-based config (no `tailwind.config.ts`). Theme variables defined in `src/app/globals.css` via `@theme`. Seven color themes applied via `data-theme` attribute on `<html>`. Dark mode via `.dark` class. Theme definitions in `src/lib/themes.ts`.

**Font configuration:** Inter font loaded in `layout.tsx` with `variable: "--font-inter"` and `display: "swap"`. Applied via `inter.variable` on `<html>` className. Font family defined in `globals.css` as `--font-sans: var(--font-inter)`.

### i18n

Custom translation system in `src/lib/i18n/` with `createT(locale)` returning a `TFunction`. Two locales: `id` (Bahasa Indonesia, default) and `en`. Translation keys typed via `TranslationKey`. Locale persisted in localStorage as `finsnap-locale`.

**Icon consistency:** `NAV_ICON_MAP` in `src/lib/nav-icon-map.ts` maps translation keys to Lucide icons, ensuring feature navigation icons stay in sync across components.

### Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### UI Components

shadcn/ui components in `src/components/ui/`. Feature components organized by domain: `src/components/{landing,layout,dashboard,wallets,transactions,budgets,categories,debts,shopping,templates}/`.

### PWA (Progressive Web App)

Powered by `@serwist/next`. Service worker source at `src/app/sw.ts`, compiled to `public/sw.js`.

- **Precaching:** All static routes precached with git revision as cache key (see `STATIC_ROUTES` in `next.config.ts`)
- **Runtime caching:** Images cached with `CacheFirst` strategy (30-day expiry, 64 entries max), plus Serwist defaults
- **Offline fallback:** `/~offline` page served when network is unavailable (`src/app/~offline/page.tsx`)
- **Disabled in dev:** `disable: process.env.NODE_ENV === "development"` in next.config.ts
- **Manifest:** `src/app/manifest.ts` (Next.js metadata route)
- **Install prompt hook:** `src/hooks/use-install-prompt.ts` — captures `beforeinstallprompt` event
- **Online status hook:** `src/hooks/use-online-status.ts` — tracks navigator.onLine
- **Offline banner:** `src/components/layout/offline-banner.tsx`

### Next.js Optimizations

**Package imports:** `lucide-react`, `recharts`, and `date-fns` are in Next.js 16's default `optimizePackageImports` list — no explicit config needed. Turbopack is the default bundler in Next.js 16.

## MCP Tools

Always use **Context7 MCP** (`resolve-library-id` → `query-docs`) when needing library/API documentation, code generation, setup or configuration steps — without the user having to explicitly ask. This applies to any task involving external libraries (e.g., Next.js, Zustand, Zod, React Hook Form, Tailwind CSS, shadcn/ui, etc.).

---

## Working Style

### Clarifying Questions First

Before writing code, assess whether the request has ambiguity. If it does, ask 2-3 targeted clarifying questions first. This prevents wasted work on plans that miss the mark.

Ask when:

- The scope is unclear (e.g., "add a settings feature" — which settings?)
- Multiple valid approaches exist
- UI/UX behavior is not specified
- New data fields are implied but not defined

Do not ask when:

- The task is explicitly defined with clear acceptance criteria
- It is a bug fix with a reproducible issue
- The user says "just do it" or provides a detailed spec
- The answer is obvious from existing codebase patterns

### Task Approach

- **Simple** (single file, <30 lines): Execute directly. No planning needed.
- **Moderate** (2-4 files, clear scope): Brief outline, then execute.
- **Large** (5+ files, new domain): Use the New Feature skill (`.claude/skills/new-feature.md`), save plan to `docs/plans/`. Ask user first.

Execute all work directly. No delegation to sub-agents.

### Quality Gates

After significant changes, run these in order:

1. `npm run build` — must pass (catches type errors, wrong imports, missing exports)
2. `npm run lint` — must pass with 0 errors (catches React Compiler violations, unused vars)
3. `npm run format` — apply Biome formatting

### Project-Specific Pitfalls

Hard-won lessons — always verify these before writing code that touches these areas:

- `CurrencyInput` uses `currencyCode` prop, not `currency`
- `Badge` only has variants: `default`, `secondary`, `destructive`, `outline` — use `className` for custom colors
- `CurrencyCode` type lives in `@/lib/currencies`, not `@/types`
- Verify i18n keys exist in `src/lib/i18n/id.ts` before using them in components
- Read actual component prop interfaces before using them in new code
- Wrap Zod schemas and filtered arrays in `useMemo`
- No component creation inside render functions (React Compiler `static-components` rule)
- Bare `catch {}` when error variable is unused
- **`<SelectItem value="">` throws at runtime** — Radix UI reserves `""` as the "clear selection" sentinel. For "no selection" options (e.g. "No Category"), use `value="__none__"` and map in both directions: `value={field.value || "__none__"}` on `<Select>`, and `onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}`
