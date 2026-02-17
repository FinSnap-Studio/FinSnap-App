# Shopping List Feature — Implementation Plan

## Overview

Shopping List as a Budget Planner — multiple lists per trip, estimated prices, auto-create expense transactions when items are purchased. Integrated with wallet, transaction, category, and budget stores.

## Status: COMPLETE

## Steps

### Phase 1: Foundation

1. **Types** — Add to `src/types/index.ts`:
   - `ShoppingListStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED"`
   - `ShoppingItemStatus = "PENDING" | "PURCHASED" | "SKIPPED"`
   - `ShoppingItem`, `ShoppingList`, `ShoppingListFormInput`, `ShoppingItemFormInput`

2. **Storage key** — Add `shoppingLists: "finsnap-shopping-lists"` to `STORAGE_KEYS` in `src/lib/storage.ts`

3. **Validation schemas** — Create `src/lib/validations/shopping.ts` with `createShoppingListSchema(t)` and `createShoppingItemSchema(t)`

4. **Store** — Create `src/stores/shopping-store.ts` (pattern: `debt-store.ts`)
   - List CRUD: `fetchShoppingLists`, `addShoppingList`, `updateShoppingList`, `deleteShoppingList`, `archiveShoppingList`
   - Item CRUD: `addItem`, `updateItem`, `removeItem`
   - Purchase: `purchaseItem` (auto-creates EXPENSE transaction), `skipItem`, `purchaseAllRemaining`
   - Auto-complete: when all items are PURCHASED/SKIPPED, list status → COMPLETED

5. **i18n** — Add ~50 `shopping.*` and validation keys to `src/lib/i18n/id.ts` and `src/lib/i18n/en.ts`

6. **Navigation** — Update `src/lib/constants.ts`:
   - Add `ShoppingCart` import from lucide-react
   - Add nav item `{ label: "nav.shopping", href: "/shopping", icon: "ShoppingCart" }`
   - Add to `NAV_ICON_MAP`

7. **Layout hydration** — Update `src/app/(dashboard)/layout.tsx`:
   - Import `useShoppingStore`
   - Add `fetchShoppingLists` to `Promise.all`

### Phase 2: Components

8. **shopping-list-card.tsx** — Card showing list name, wallet, item count, estimated total, progress bar
9. **shopping-list-form.tsx** — Dialog form for creating/editing a list (name + wallet selector)
10. **shopping-item-card.tsx** — Row for single item with checkbox, name, qty, price, category badge, purchase/skip actions
11. **shopping-item-form.tsx** — Dialog form for adding/editing an item (name, qty, estimated price, category)
12. **shopping-purchase-dialog.tsx** — Confirmation dialog with actual price input before creating transaction
13. **shopping-list-summary.tsx** — Summary cards (estimated total, actual spent, items remaining)

### Phase 3: Pages

14. **Shopping Lists page** — `src/app/(dashboard)/shopping/page.tsx`
    - Header + "Buat Daftar" button
    - Summary cards (total estimated, total spent, items remaining across all active lists)
    - Tabs: Active / Completed / Archived
    - ShoppingListCard grid
    - Dialogs: ShoppingListForm, delete AlertDialog

15. **Shopping List Detail page** — `src/app/(dashboard)/shopping/[id]/page.tsx`
    - Back button, list name, wallet info, progress bar
    - "Tambah Item" button
    - ShoppingItemCard list with purchase interaction
    - Running totals: estimated vs actual
    - "Selesaikan Daftar" / "Arsipkan" actions
    - Dialogs: ShoppingItemForm, ShoppingPurchaseDialog, delete item AlertDialog

### Phase 4: Verification

16. Run `npm run build` and `npm run lint` — fix any issues

## Integration Points

- **Transaction Store**: `purchaseItem` → `addTransaction({ type: "EXPENSE", ... })`
- **Wallet Store**: read-only for wallet picker & currency
- **Category Store**: read-only for category picker (EXPENSE categories)
- **Budget Store**: no direct integration (auto-triggered by addTransaction)

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Add 6 new types |
| `src/lib/storage.ts` | Add storage key |
| `src/lib/constants.ts` | Add nav item + icon |
| `src/lib/i18n/id.ts` | Add ~50 keys |
| `src/lib/i18n/en.ts` | Add ~50 keys |
| `src/app/(dashboard)/layout.tsx` | Add store hydration |

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/validations/shopping.ts` | Zod schemas |
| `src/stores/shopping-store.ts` | Zustand store |
| `src/components/shopping/shopping-list-card.tsx` | List card |
| `src/components/shopping/shopping-list-form.tsx` | List form dialog |
| `src/components/shopping/shopping-item-card.tsx` | Item card/row |
| `src/components/shopping/shopping-item-form.tsx` | Item form dialog |
| `src/components/shopping/shopping-purchase-dialog.tsx` | Purchase confirmation |
| `src/components/shopping/shopping-list-summary.tsx` | Summary cards |
| `src/app/(dashboard)/shopping/page.tsx` | Main page |
| `src/app/(dashboard)/shopping/[id]/page.tsx` | Detail page |
