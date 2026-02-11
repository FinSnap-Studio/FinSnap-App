export const STORAGE_KEYS = {
  wallets: "finsnap-wallets",
  transactions: "finsnap-transactions",
  budgets: "finsnap-budgets",
  categories: "finsnap-categories",
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
 * Overwrites any existing data so the demo always starts fresh.
 */
export function seedDemoData(): void {
  // Lazy import to avoid pulling mock-data into every store bundle
  const { MOCK_WALLETS, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_CATEGORIES } =
    require("@/data/mock-data");

  storageSet(STORAGE_KEYS.categories, MOCK_CATEGORIES);
  storageSet(STORAGE_KEYS.wallets, MOCK_WALLETS);
  storageSet(STORAGE_KEYS.transactions, MOCK_TRANSACTIONS);
  storageSet(STORAGE_KEYS.budgets, MOCK_BUDGETS);
}
