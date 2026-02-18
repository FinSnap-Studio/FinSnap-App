export const STORAGE_KEYS = {
  wallets: "finsnap-wallets",
  transactions: "finsnap-transactions",
  budgets: "finsnap-budgets",
  categories: "finsnap-categories",
  templates: "finsnap-templates",
  recurring: "finsnap-recurring",
  debts: "finsnap-debts",
  shoppingLists: "finsnap-shopping-lists",
} as const;

export function storageGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function storageRemove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function storageClearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

/**
 * Seed localStorage with all mock data for "Try Demo" flow.
 * Writes data in Zustand persist format { state: { key: data }, version: 0 }
 * so rehydration works correctly on the next page load.
 */
export async function seedDemoData(): Promise<void> {
  // Lazy import to avoid pulling mock-data into every store bundle
  const {
    MOCK_WALLETS,
    MOCK_TRANSACTIONS,
    MOCK_BUDGETS,
    MOCK_CATEGORIES,
    MOCK_TEMPLATES,
    MOCK_RECURRING,
    MOCK_DEBTS,
    MOCK_SHOPPING_LISTS,
  } = await import("@/data/mock-data");

  storageSet(STORAGE_KEYS.categories, { state: { categories: MOCK_CATEGORIES }, version: 0 });
  storageSet(STORAGE_KEYS.wallets, { state: { wallets: MOCK_WALLETS }, version: 0 });
  storageSet(STORAGE_KEYS.transactions, { state: { transactions: MOCK_TRANSACTIONS }, version: 0 });
  storageSet(STORAGE_KEYS.budgets, { state: { budgets: MOCK_BUDGETS }, version: 0 });
  storageSet(STORAGE_KEYS.templates, { state: { templates: MOCK_TEMPLATES }, version: 0 });
  storageSet(STORAGE_KEYS.recurring, { state: { recurrings: MOCK_RECURRING }, version: 0 });
  storageSet(STORAGE_KEYS.debts, { state: { debts: MOCK_DEBTS }, version: 0 });
  storageSet(STORAGE_KEYS.shoppingLists, {
    state: { shoppingLists: MOCK_SHOPPING_LISTS },
    version: 0,
  });
}
