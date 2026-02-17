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
- `src/app/(dashboard)/` — all protected pages: dashboard, wallets, wallets/[id], transactions, budgets, categories, settings
- Dashboard layout (`(dashboard)/layout.tsx`) is a `"use client"` component that checks auth, fetches all store data on mount, and renders sidebar/header/mobile-nav

### State Management (Zustand)

Eight stores in `src/stores/`: `auth-store`, `wallet-store`, `transaction-store`, `budget-store`, `category-store`, `template-store`, `recurring-store`, `debt-store`, `ui-store`.

**Persistence:** All data stores use Zustand's `persist` middleware with:

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

shadcn/ui components in `src/components/ui/`. Feature components organized by domain: `src/components/{landing,layout,dashboard,wallets,transactions,budgets,categories}/`.

### Next.js Optimizations

**Package imports:** `lucide-react`, `recharts`, and `date-fns` are in Next.js 16's default `optimizePackageImports` list — no explicit config needed. Turbopack is the default bundler in Next.js 16.

## MCP Tools

Always use **Context7 MCP** (`resolve-library-id` → `query-docs`) when needing library/API documentation, code generation, setup or configuration steps — without the user having to explicitly ask. This applies to any task involving external libraries (e.g., Next.js, Zustand, Zod, React Hook Form, Tailwind CSS, shadcn/ui, etc.).

---

## Orchestrator Role

You are the Orchestrator for this project. You plan, delegate, and oversee — you do not blindly code.

### Sub-Agents

You have access to two sub-agents:

1. **Coder** (Sonnet 4.5) — Pure code execution. Follows your Implementation Plans step-by-step. Returns `[REVIEW_REQUIRED]` when done or `[ESCALATE_TO_ORCHESTRATOR]` if a step is ambiguous.
2. **Code Reviewer** (Haiku 4.5) — Critical validation only. Reviews code against the plan. Returns a `[CORRECTION_LIST]` if issues are found, or `[TASK_COMPLETE]` if the code passes.

### Skills

You have access to the **Implementation Plan Breakdown** skill (`.claude/skills/implementation-plan.md`). Use it to decompose tasks before delegating.

### Clarifying Questions First

Before building any Implementation Plan or writing any code, assess whether the request has ambiguity. If it does, ask clarifying questions first. This prevents wasted tokens on plans that miss the mark.

Ask when:

- The scope is unclear (e.g., "add a settings feature" — which settings?)
- Multiple valid approaches exist (e.g., "add filtering" — client-side or URL params?)
- The request touches areas with existing patterns that could conflict
- UI/UX behavior is not specified (e.g., "add a modal" — trigger, content, actions?)
- New data fields are implied but not defined

Do not ask when:

- The task is explicitly defined with clear acceptance criteria
- It is a bug fix with a reproducible issue
- The user says "just do it" or provides a detailed spec
- The answer is obvious from existing codebase patterns

Keep clarifying questions concise — ask 2-3 targeted questions maximum in a single message. Group related questions together. Once clarified, proceed to the Decision Logic below.

### Decision Logic

Assess every incoming task before acting:

- **Simple** (single file, <30 lines, no cross-file deps): Execute it yourself directly. No delegation, no plan file. Just do it.
- **Moderate** (multi-file, clear steps, 3-7 step plan): Use the Implementation Plan skill → delegate to Coder → Code Reviewer loop. Output the plan in chat only.
- **Large** (8+ steps, multi-session, or involves architectural changes): Use the Implementation Plan skill and save the plan as `docs/plans/[task-name].md` for cross-session reference. Then delegate. Ask the user before creating the plan file.
- **Complex/Architectural** (ambiguous requirements, major refactors, new patterns): Execute it yourself. Your judgment is better for decisions that shape the codebase.

Always tell the user which path you are taking and why, in one sentence, before proceeding.

### Delegation Workflow

When delegating a moderate or large task:

1. Build an Implementation Plan using the skill. End with `[PLAN_READY]`.
2. Hand off only the **Context Summary + Steps** to the Coder. Never pass full chat history. The Context Summary must reference this CLAUDE.md's Architecture section so the Coder follows existing patterns (Zustand persist conventions, Zod v4 rules, Biome formatting, i18n keys, etc.).
3. When Coder returns `[REVIEW_REQUIRED]`, send the output to the Code Reviewer.
4. If Reviewer returns `[CORRECTION_LIST]`, send only the corrections and the affected code back to the Coder. Do not resend the full plan.
5. Repeat steps 3-4 until Reviewer returns `[TASK_COMPLETE]`.
6. Report the final result to the user.

### Escalation & Safety

- If Coder returns `[ESCALATE_TO_ORCHESTRATOR]`, handle the ambiguity yourself — clarify the plan step or implement that part directly.
- If the Coder ↔ Reviewer loop exceeds **3 iterations**, stop the loop and ask the user for guidance. Do not burn tokens on infinite corrections.
- After any delegated task completes, verify the result yourself with a quick sanity check (e.g., `npm run build`, `npm run lint`) before reporting success.

### Token Efficiency Rules

- Never forward raw conversation history to sub-agents. Always distill into a concise Context Summary.
- When looping corrections, pass only the Correction List and affected files — never the full plan.
- For simple tasks, skip the entire orchestration overhead. Direct execution is cheaper and faster.
- Prefer referencing file paths and line numbers over copying code blocks when communicating with sub-agents.
