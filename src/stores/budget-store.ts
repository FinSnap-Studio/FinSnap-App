import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Budget, BudgetFormInput } from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { useTransactionStore } from "./transaction-store";

interface BudgetStore {
  budgets: Budget[];
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;
  fetchBudgets: (month: number, year: number) => Promise<void>;
  addBudget: (input: BudgetFormInput) => Promise<Budget>;
  updateBudget: (id: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setMonth: (month: number, year: number) => void;
  recalculateSpent: (categoryId: string) => void;
  getBudgetsByMonth: () => Budget[];
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      isLoading: false,

      // TODO: Replace → GET /api/budgets?month=X&year=Y
      fetchBudgets: async (_month, _year) => {
        set({ isLoading: true });
        await useBudgetStore.persist.rehydrate();
        set({ isLoading: false });
      },

      // TODO: Replace → POST /api/budgets
      addBudget: async (input) => {
        const now = new Date().toISOString();
        const budget: Budget = {
          id: generateId(),
          amount: input.amount,
          spent: 0,
          currency: input.currency,
          month: input.month,
          year: input.year,
          userId: "user-mock-001",
          categoryId: input.categoryId,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ budgets: [...s.budgets, budget] }));
        // Recalculate spent from existing transactions
        get().recalculateSpent(input.categoryId);
        return budget;
      },

      // TODO: Replace → PATCH /api/budgets/[id]
      updateBudget: async (id, amount) => {
        set((s) => ({
          budgets: s.budgets.map((b) =>
            b.id === id ? { ...b, amount, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      // TODO: Replace → DELETE /api/budgets/[id]
      deleteBudget: async (id) => {
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
      },

      setMonth: (month, year) => {
        set({ selectedMonth: month, selectedYear: year });
      },

      // Will be removed on API migration (server computes)
      recalculateSpent: (categoryId) => {
        const transactions = useTransactionStore.getState().transactions;
        const { selectedMonth, selectedYear, budgets } = get();

        // For each budget matching this category, recalculate spent filtering by currency
        const updatedBudgets = budgets.map((b) => {
          if (
            b.categoryId !== categoryId ||
            b.month !== selectedMonth ||
            b.year !== selectedYear
          ) {
            return b;
          }

          const spent = transactions
            .filter((t: { type: string; categoryId: string | null; date: string; currency: string }) => {
              if (t.type !== "EXPENSE" || t.categoryId !== categoryId) return false;
              if (t.currency !== b.currency) return false;
              const d = new Date(t.date);
              return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
            })
            .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

          return { ...b, spent, updatedAt: new Date().toISOString() };
        });

        set({ budgets: updatedBudgets });
      },

      getBudgetsByMonth: () => {
        const { budgets, selectedMonth, selectedYear } = get();
        return budgets.filter(
          (b) => b.month === selectedMonth && b.year === selectedYear
        );
      },
    }),
    {
      name: STORAGE_KEYS.budgets,
      skipHydration: true,
      partialize: (state) => ({ budgets: state.budgets }),
    }
  )
);
