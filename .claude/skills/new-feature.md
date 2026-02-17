# New Domain Feature

Recipe for adding a new domain feature to FinSnap (e.g., wallets, debts, shopping). Follow these steps in order. Each step must be complete before moving to the next.

## Step 1: Types (`src/types/index.ts`)

Add near the bottom, before `TransactionFilters`:

```ts
export type XxxStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED"; // adjust per domain

export interface Xxx {
  id: string;
  // domain fields...
  status: XxxStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface XxxFormInput {
  // only user-editable fields, no id/dates/userId
}
```

`CurrencyCode` is re-exported here but originates from `@/lib/currencies`. If a new type needs it, import from `@/lib/currencies` in files outside `types/`.

## Step 2: Storage Key (`src/lib/storage.ts`)

Add to `STORAGE_KEYS`:

```ts
xxxs: "finsnap-xxxs",
```

## Step 3: Validation (`src/lib/validations/xxx.ts`)

```ts
import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createXxxSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("validation.xxxNameRequired")).max(50, t("validation.xxxNameMax")),
    // z.coerce.number() for numeric fields from inputs
    // z.string().optional().default("") for optional strings
  });
}
```

Rules:
- `z.coerce.number()` for any number that comes from an `<Input type="number" />`
- `{ message: "..." }` not `{ required_error: "..." }` for enums and dates
- One `createXxxSchema(t)` function per form, receives `TFunction` for i18n error messages

## Step 4: Store (`src/stores/xxx-store.ts`)

Exact structure — do not deviate:

```ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { XxxType, XxxFormInput } from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";
// Cross-store: top-level import, .getState() inside function body
import { useOtherStore } from "./other-store";

interface XxxStore {
  xxxs: Xxx[];
  isLoading: boolean;
  fetchXxxs: () => Promise<void>;
  addXxx: (input: XxxFormInput) => Promise<Xxx>;
  updateXxx: (id: string, input: Partial<XxxFormInput>) => Promise<void>;
  deleteXxx: (id: string) => Promise<boolean>;
}

export const useXxxStore = create<XxxStore>()(
  devtools(
    persist(
      (set, get) => ({
        xxxs: [],
        isLoading: false,

        // TODO: Replace → GET /api/xxxs
        fetchXxxs: async () => {
          set({ isLoading: true });
          await useXxxStore.persist.rehydrate();
          set({ isLoading: false });
        },

        // TODO: Replace → POST /api/xxxs
        addXxx: async (input) => {
          const now = new Date().toISOString();
          const xxx: Xxx = {
            id: generateId(),
            ...input,
            userId: MOCK_USER_ID,
            createdAt: now,
            updatedAt: now,
          };
          set({ xxxs: [...get().xxxs, xxx] });
          return xxx;
        },

        // TODO: Replace → PATCH /api/xxxs/:id
        updateXxx: async (id, input) => {
          const now = new Date().toISOString();
          set({
            xxxs: get().xxxs.map((x) =>
              x.id === id ? { ...x, ...input, updatedAt: now } : x
            ),
          });
        },

        // TODO: Replace → DELETE /api/xxxs/:id
        deleteXxx: async (id) => {
          set({ xxxs: get().xxxs.filter((x) => x.id !== id) });
          return true;
        },
      }),
      {
        name: STORAGE_KEYS.xxxs,
        skipHydration: true,
        partialize: (state) => ({ xxxs: state.xxxs }),
      },
    ),
    { name: "xxx-store", enabled: process.env.NODE_ENV === "development" },
  ),
);
```

Cross-store access pattern (e.g., creating a transaction on purchase):
```ts
const txStore = useTransactionStore.getState();
await txStore.addTransaction({ ... });
```

## Step 5: i18n (`src/lib/i18n/id.ts` + `en.ts`)

Add keys for:
- `nav.xxx` — sidebar label
- `xxx.*` — page titles, form labels, button text, toast messages, status labels
- `validation.xxx*` — validation error messages

Verify every key you use in `t("key")` actually exists in `id.ts`. The `en.ts` file must have the same keys as `Record<TranslationKey, string>` — TypeScript will error if keys are missing.

## Step 6: Navigation (`src/lib/constants.ts` + `src/lib/nav-icon-map.ts`)

In `constants.ts`, add nav item to `NAV_ITEMS`:
```ts
{ label: "nav.xxx" as TranslationKey, href: "/xxx", icon: "IconName" },
```

In `nav-icon-map.ts`, add to `NAV_ICON_MAP`:
```ts
"nav.xxx": IconName,
```

## Step 7: Components (`src/components/xxx/`)

### Form Dialog Pattern

```tsx
"use client";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema and filtered data MUST be in useMemo
const schema = useMemo(() => createXxxSchema(t), [t]);
const filteredItems = useMemo(() => items.filter(...), [items]);

// zodResolver type workaround
const form = useForm<XxxFormInput>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: zodResolver(schema) as any,
  defaultValues: { ... },
});

// Reset on dialog open
useEffect(() => {
  if (open) reset(editItem ? { ...editItem } : defaultValues);
}, [open, editItem, reset]);

// CurrencyInput — correct props:
<CurrencyInput
  value={field.value}
  onChange={field.onChange}
  onBlur={field.onBlur}
  currencyCode={currency}    // NOT "currency"
  hasError={!!errors.field}  // optional
/>

// Badge — valid variants only:
// default, secondary, destructive, outline
// For custom colors, use className:
<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">

// Error handling:
catch {                      // bare catch, no (error) if unused
  toast.error(t("xxx.saveError"));
}
```

### Card Component Pattern

- Use `useMemo` for derived lookups (category maps, wallet lookups)
- No component creation inside render — use variables with inline JSX
- `formatCurrency(amount, currencyCode)` from `@/lib/utils`

## Step 8: Pages (`src/app/(dashboard)/xxx/`)

### List Page (`page.tsx`)

- `"use client"` directive
- Filter lists by status with `useMemo`
- Tabs pattern: Active / Completed / Archived
- Dialog state: `formOpen`, `editTarget`, `deleteTarget`
- AlertDialog for delete confirmation

### Detail Page (`[id]/page.tsx`)

- Unwrap params with `use()`: `const { id } = use(params);`
- Find item: `const item = useMemo(() => store.find(...), [store, id]);`
- Redirect if not found: `if (!item) { router.replace("/xxx"); return null; }`

## Step 9: Layout Hydration (`src/app/(dashboard)/layout.tsx`)

1. Import the store
2. Add `fetchXxxs` selector
3. Add to `Promise.all` in the `loadData` function
4. Add to the `useEffect` dependency array

## Pre-Commit Checklist

Before running build, self-verify:

- [ ] Every `t("key")` call uses a key that exists in `id.ts`
- [ ] `CurrencyInput` uses `currencyCode` prop
- [ ] `Badge` uses only valid variants (custom colors via `className`)
- [ ] `CurrencyCode` imported from `@/lib/currencies`
- [ ] All `useMemo` wrappers in place (schemas, filtered arrays, lookups)
- [ ] No components created inside render functions
- [ ] All `catch {}` blocks use bare catch when error is unused
- [ ] Store uses `persist` + `skipHydration: true` + `partialize` + `devtools`

Then run: `npm run build && npm run lint && npm run format`
