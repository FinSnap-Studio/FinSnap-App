# Implementation Plan Breakdown

When a task involves creating or modifying multiple files, components, or features in the FinSnap project, decompose the request into a granular Implementation Plan before delegating to sub-agents.

## Plan Structure

Every plan must contain these four sections:

### 1. Context Summary

A brief 3-5 sentence summary providing the Coder with only what it needs to know. Must include:

- What area of the app is affected (routing group, store, component domain)
- Relevant existing patterns from CLAUDE.md (e.g., "Zustand stores use persist with skipHydration: true", "forms use React Hook Form + Zod v4")
- Key file paths the Coder will read or modify
- Any active constraints (e.g., "no backend API — all data in localStorage via Zustand persist")

This summary replaces passing full conversation history. The Coder receives nothing else for context.

### 2. Steps

A numbered list where each step is one atomic unit of work. Each step must follow this format:

```
Step N: [Action verb] [what to build/modify] in [file path]
- Details: [function signatures, prop types, API shape, Zod schema, store actions]
- Depends on: [Step X, Step Y] or "none"
- Done when: [specific acceptance criteria]
```

Rules for steps:

- Order by dependency — foundations first (types, schemas, store), integrations last (UI, wiring)
- One file per step when possible. If a step touches multiple files, explain why.
- Include exact file paths relative to `src/`
- For new Zustand store actions: specify the action signature and which state fields it modifies
- For new components: specify props interface and which store hooks it consumes
- For Zod schemas: specify field types and any refinements needed
- For i18n: include both `id` and `en` translation keys

### 3. Constraints

Non-obvious requirements the Coder must respect:

- Biome v2 formatting (double quotes, semicolons, 100-char width)
- Zod v4 conventions (see CLAUDE.md Forms & Validation section)
- `useWatch` instead of `form.watch()` for React Compiler compatibility
- No manual `localStorage` access — Zustand persist only
- `MOCK_USER_ID` from `src/lib/constants.ts` for any user-scoped data
- Category lookups via `useMemo(() => new Map(...))` pattern
- `createT(locale)` for any new UI strings — both `id` and `en` locales

### 4. Output Marker

End every plan with `[PLAN_READY]`.

## Output Format Decision

- **3-7 steps (moderate task):** Output the plan in chat only. No file needed.
- **8+ steps (large task):** Ask the user first, then save the plan as `docs/plans/[task-name].md` for cross-session reference. The Coder and Reviewer can reference this file directly.

## When NOT to Use This Skill

- Task is simple: single file, <30 lines, no cross-file dependencies → execute directly.
- Task is architecturally complex or ambiguous → Orchestrator executes directly without delegation.
- User explicitly says "just do it" or "don't plan" → skip planning.

## Example Plan

```
## Context Summary

Adding a recurring transaction auto-execution feature. FinSnap currently has
a `recurring-store` with CRUD actions but no auto-execution logic. The dashboard
layout mounts all stores on load via `fetchXxx()`. We need a new action in the
recurring store that checks due dates and creates transactions automatically.
Stack: Next.js App Router, Zustand with persist, Zod v4, TypeScript.

## Steps

Step 1: Add `RecurringExecution` type in `src/types/index.ts`
- Details: `{ id: string; recurringId: string; executedAt: Date; transactionId: string }`
- Depends on: none
- Done when: type is exported and available for import

Step 2: Add `executeRecurringTransactions` action in `src/stores/recurring-store.ts`
- Details: action checks all recurring items where `nextDueDate <= today`,
  calls `useTransactionStore.getState().addTransaction()` for each,
  updates `nextDueDate` based on frequency
- Depends on: Step 1
- Done when: action creates transactions and advances due dates correctly

Step 3: Call `executeRecurringTransactions()` in `src/app/(dashboard)/layout.tsx`
- Details: add call after existing `fetchRecurring()` in the `useEffect` mount block
- Depends on: Step 2
- Done when: recurring transactions auto-execute on dashboard load

Step 4: Add i18n keys for execution toast notifications
- Details: keys `recurring.executed` and `recurring.executedCount` in both `id` and `en` locale files
- Depends on: none
- Done when: both locale files updated with new keys

## Constraints

- Use `useTransactionStore.getState()` for cross-store access (no hooks outside components)
- Follow Biome formatting: double quotes, semicolons
- No manual localStorage — recurring store already has persist middleware

[PLAN_READY]
```
