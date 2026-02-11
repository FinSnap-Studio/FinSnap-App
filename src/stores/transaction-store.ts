import { create } from "zustand";
import { Transaction, TransactionFormInput, TransactionFilters, CategoryExpense, DailyTotal, MonthlyTrend } from "@/types";
import { generateId } from "@/lib/utils";
import { storageGet, storageSet, STORAGE_KEYS } from "@/lib/storage";
import { useWalletStore } from "./wallet-store";
import { useBudgetStore } from "./budget-store";

interface TransactionStore {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (input: TransactionFormInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: TransactionFormInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  getFilteredTransactions: () => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getMonthlyIncome: (month: number, year: number) => Record<string, number>;
  getMonthlyExpense: (month: number, year: number) => Record<string, number>;
  getTransactionsByWallet: (walletId: string) => Transaction[];
  getExpenseByCategory: (month: number, year: number) => CategoryExpense[];
  getDailyTotals: (month: number, year: number) => DailyTotal[];
  getMonthlyTrend: (months: number) => MonthlyTrend[];
}

const DEFAULT_FILTERS: TransactionFilters = {
  type: "ALL",
  walletId: undefined,
  categoryId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  search: undefined,
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,

  // TODO: Replace → GET /api/transactions
  fetchTransactions: async () => {
    set({ isLoading: true });
    const stored = storageGet<Transaction[]>(STORAGE_KEYS.transactions);
    if (stored) {
      set({ transactions: stored, isLoading: false });
    } else {
      const empty: Transaction[] = [];
      storageSet(STORAGE_KEYS.transactions, empty);
      set({ transactions: empty, isLoading: false });
    }
  },

  // TODO: Replace → POST /api/transactions
  addTransaction: async (input) => {
    const now = new Date().toISOString();
    const walletStore = useWalletStore.getState();
    const sourceCurrency = walletStore.getWalletCurrency(input.walletId);

    let toCurrency = null;
    let toAmount = null;
    if (input.type === "TRANSFER" && input.toWalletId) {
      toCurrency = walletStore.getWalletCurrency(input.toWalletId);
      if (toCurrency !== sourceCurrency && input.toAmount) {
        toAmount = input.toAmount;
      }
    }

    const transaction: Transaction = {
      id: generateId(),
      amount: input.amount,
      currency: sourceCurrency,
      type: input.type,
      description: input.description || "",
      date: input.date.toISOString(),
      userId: "user-mock-001",
      walletId: input.walletId,
      categoryId: input.type === "TRANSFER" ? null : (input.categoryId || null),
      toWalletId: input.type === "TRANSFER" ? (input.toWalletId || null) : null,
      toAmount,
      toCurrency,
      createdAt: now,
      updatedAt: now,
    };

    // Update wallet balance
    if (input.type === "INCOME") {
      walletStore.updateBalance(input.walletId, input.amount, "add");
    } else if (input.type === "EXPENSE") {
      walletStore.updateBalance(input.walletId, input.amount, "subtract");
    } else if (input.type === "TRANSFER" && input.toWalletId) {
      walletStore.updateBalance(input.walletId, input.amount, "subtract");
      const creditAmount = toAmount ?? input.amount;
      walletStore.updateBalance(input.toWalletId, creditAmount, "add");
    }

    set((s) => {
      const transactions = [transaction, ...s.transactions];
      storageSet(STORAGE_KEYS.transactions, transactions);
      return { transactions };
    });

    // Recalculate budget if expense
    if (input.type === "EXPENSE" && input.categoryId) {
      useBudgetStore.getState().recalculateSpent(input.categoryId);
    }

    return transaction;
  },

  // TODO: Replace → PATCH /api/transactions/[id]
  updateTransaction: async (id, input) => {
    const oldTx = get().transactions.find((t) => t.id === id);
    if (!oldTx) return;

    const walletStore = useWalletStore.getState();

    // Reverse old transaction effect
    if (oldTx.type === "INCOME") {
      walletStore.updateBalance(oldTx.walletId, oldTx.amount, "subtract");
    } else if (oldTx.type === "EXPENSE") {
      walletStore.updateBalance(oldTx.walletId, oldTx.amount, "add");
    } else if (oldTx.type === "TRANSFER" && oldTx.toWalletId) {
      walletStore.updateBalance(oldTx.walletId, oldTx.amount, "add");
      const oldCreditAmount = oldTx.toAmount ?? oldTx.amount;
      walletStore.updateBalance(oldTx.toWalletId, oldCreditAmount, "subtract");
    }

    // Apply new transaction effect
    const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
    let toCurrency = null;
    let toAmount = null;

    if (input.type === "INCOME") {
      walletStore.updateBalance(input.walletId, input.amount, "add");
    } else if (input.type === "EXPENSE") {
      walletStore.updateBalance(input.walletId, input.amount, "subtract");
    } else if (input.type === "TRANSFER" && input.toWalletId) {
      toCurrency = walletStore.getWalletCurrency(input.toWalletId);
      if (toCurrency !== sourceCurrency && input.toAmount) {
        toAmount = input.toAmount;
      }
      walletStore.updateBalance(input.walletId, input.amount, "subtract");
      const creditAmount = toAmount ?? input.amount;
      walletStore.updateBalance(input.toWalletId, creditAmount, "add");
    }

    const now = new Date().toISOString();
    set((s) => {
      const transactions = s.transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              amount: input.amount,
              currency: sourceCurrency,
              type: input.type,
              description: input.description || "",
              date: input.date.toISOString(),
              walletId: input.walletId,
              categoryId: input.type === "TRANSFER" ? null : (input.categoryId || null),
              toWalletId: input.type === "TRANSFER" ? (input.toWalletId || null) : null,
              toAmount,
              toCurrency,
              updatedAt: now,
            }
          : t
      );
      storageSet(STORAGE_KEYS.transactions, transactions);
      return { transactions };
    });

    // Recalculate budgets for old and new categories
    const budgetStore = useBudgetStore.getState();
    if (oldTx.type === "EXPENSE" && oldTx.categoryId) {
      budgetStore.recalculateSpent(oldTx.categoryId);
    }
    if (input.type === "EXPENSE" && input.categoryId) {
      budgetStore.recalculateSpent(input.categoryId);
    }
  },

  // TODO: Replace → DELETE /api/transactions/[id]
  deleteTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse transaction effect
    const walletStore = useWalletStore.getState();
    if (tx.type === "INCOME") {
      walletStore.updateBalance(tx.walletId, tx.amount, "subtract");
    } else if (tx.type === "EXPENSE") {
      walletStore.updateBalance(tx.walletId, tx.amount, "add");
    } else if (tx.type === "TRANSFER" && tx.toWalletId) {
      walletStore.updateBalance(tx.walletId, tx.amount, "add");
      const creditAmount = tx.toAmount ?? tx.amount;
      walletStore.updateBalance(tx.toWalletId, creditAmount, "subtract");
    }

    set((s) => {
      const transactions = s.transactions.filter((t) => t.id !== id);
      storageSet(STORAGE_KEYS.transactions, transactions);
      return { transactions };
    });

    // Recalculate budget if was expense
    if (tx.type === "EXPENSE" && tx.categoryId) {
      useBudgetStore.getState().recalculateSpent(tx.categoryId);
    }
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  getFilteredTransactions: () => {
    const { transactions, filters } = get();
    let result = [...transactions];

    if (filters.type && filters.type !== "ALL") {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.walletId) {
      result = result.filter(
        (t) => t.walletId === filters.walletId || t.toWalletId === filters.walletId
      );
    }
    if (filters.categoryId) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.dateFrom) {
      result = result.filter((t) => new Date(t.date) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= endOfDay);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(search)
      );
    }

    // Sort by date desc
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  },

  getRecentTransactions: (limit = 5) => {
    const { transactions } = get();
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  getMonthlyIncome: (month, year) => {
    const result: Record<string, number> = {};
    get()
      .transactions.filter((t) => {
        if (t.type !== "INCOME") return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .forEach((t) => {
        result[t.currency] = (result[t.currency] || 0) + t.amount;
      });
    return result;
  },

  getMonthlyExpense: (month, year) => {
    const result: Record<string, number> = {};
    get()
      .transactions.filter((t) => {
        if (t.type !== "EXPENSE") return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .forEach((t) => {
        result[t.currency] = (result[t.currency] || 0) + t.amount;
      });
    return result;
  },

  getTransactionsByWallet: (walletId) => {
    return get()
      .transactions.filter(
        (t) => t.walletId === walletId || t.toWalletId === walletId
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getExpenseByCategory: (month, year) => {
    const { useCategoryStore } = require("@/stores/category-store");
    const categories = useCategoryStore.getState().categories;
    const expenses = get().transactions.filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const map = new Map<string, number>();
    for (const tx of expenses) {
      if (!tx.categoryId) continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
    }

    const result: CategoryExpense[] = [];
    for (const [catId, total] of map) {
      const cat = categories.find((c: { id: string }) => c.id === catId);
      if (cat) {
        result.push({
          categoryId: catId,
          categoryName: cat.name,
          total,
          color: cat.color,
          icon: cat.icon,
        });
      }
    }
    return result.sort((a, b) => b.total - a.total);
  },

  getDailyTotals: (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = new Map<number, { income: number; expense: number }>();

    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap.set(day, { income: 0, expense: 0 });
    }

    get().transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return;
      if (t.type !== "INCOME" && t.type !== "EXPENSE") return;
      const day = d.getDate();
      const entry = dailyMap.get(day)!;
      if (t.type === "INCOME") entry.income += t.amount;
      else entry.expense += t.amount;
    });

    const result: DailyTotal[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const entry = dailyMap.get(day)!;
      result.push({
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        dayLabel: String(day),
        income: entry.income,
        expense: entry.expense,
      });
    }
    return result;
  },

  getMonthlyTrend: (months) => {
    const now = new Date();
    const result: MonthlyTrend[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();

      let income = 0;
      let expense = 0;
      get().transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d.getMonth() + 1 !== m || d.getFullYear() !== y) return;
        if (t.type === "INCOME") income += t.amount;
        else if (t.type === "EXPENSE") expense += t.amount;
      });

      result.push({
        month: m,
        year: y,
        label: monthNames[m - 1],
        income,
        expense,
      });
    }
    return result;
  },
}));
