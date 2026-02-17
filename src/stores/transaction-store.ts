import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, TransactionFormInput, TransactionFilters } from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";
import {
  applyTransactionEffect,
  reverseTransactionEffect,
  resolveTransferFields,
} from "@/lib/transaction-helpers";
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
}

const DEFAULT_FILTERS: TransactionFilters = {
  type: "ALL",
  walletId: undefined,
  categoryId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  search: undefined,
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      filters: { ...DEFAULT_FILTERS },
      isLoading: false,

      // TODO: Replace → GET /api/transactions
      fetchTransactions: async () => {
        set({ isLoading: true });
        await useTransactionStore.persist.rehydrate();
        set({ isLoading: false });
      },

      // TODO: Replace → POST /api/transactions
      addTransaction: async (input) => {
        const now = new Date().toISOString();
        const walletStore = useWalletStore.getState();
        const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
        const { toCurrency, toAmount } = resolveTransferFields(walletStore, input);

        const transaction: Transaction = {
          id: generateId(),
          amount: input.amount,
          currency: sourceCurrency,
          type: input.type,
          description: input.description || "",
          date: input.date.toISOString(),
          userId: MOCK_USER_ID,
          walletId: input.walletId,
          categoryId: input.type === "TRANSFER" ? null : (input.categoryId || null),
          toWalletId: input.type === "TRANSFER" ? (input.toWalletId || null) : null,
          toAmount,
          toCurrency,
          createdAt: now,
          updatedAt: now,
        };

        applyTransactionEffect(walletStore, {
          type: input.type,
          walletId: input.walletId,
          amount: input.amount,
          toWalletId: input.toWalletId,
          toAmount,
        });

        set((s) => ({ transactions: [transaction, ...s.transactions] }));

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
        reverseTransactionEffect(walletStore, {
          type: oldTx.type,
          walletId: oldTx.walletId,
          amount: oldTx.amount,
          toWalletId: oldTx.toWalletId,
          toAmount: oldTx.toAmount,
        });

        // Apply new transaction effect
        const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
        const { toCurrency, toAmount } = resolveTransferFields(walletStore, input);

        applyTransactionEffect(walletStore, {
          type: input.type,
          walletId: input.walletId,
          amount: input.amount,
          toWalletId: input.toWalletId,
          toAmount,
        });

        const now = new Date().toISOString();
        set((s) => ({
          transactions: s.transactions.map((t) =>
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
          ),
        }));

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
        reverseTransactionEffect(useWalletStore.getState(), {
          type: tx.type,
          walletId: tx.walletId,
          amount: tx.amount,
          toWalletId: tx.toWalletId,
          toAmount: tx.toAmount,
        });

        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }));

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
    }),
    {
      name: STORAGE_KEYS.transactions,
      skipHydration: true,
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);
