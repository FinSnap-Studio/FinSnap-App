import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { RecurringTransaction, RecurringTransactionFormInput } from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";
import { resolveTransferFields } from "@/lib/transaction-helpers";
import { useTransactionStore } from "./transaction-store";
import { useWalletStore } from "./wallet-store";

const MAX_BATCH_SIZE = 100;

interface ProcessResult {
  processed: number;
  created: number;
  details: { name: string; count: number }[];
}

interface RecurringStore {
  recurrings: RecurringTransaction[];
  isLoading: boolean;
  isProcessing: boolean;
  fetchRecurring: () => Promise<void>;
  addRecurring: (input: RecurringTransactionFormInput) => Promise<RecurringTransaction>;
  updateRecurring: (id: string, input: RecurringTransactionFormInput) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  processRecurringTransactions: () => Promise<ProcessResult>;
}

function calculateNextRunDate(from: Date, frequency: string, interval: number): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + interval * 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  return next;
}

export const useRecurringStore = create<RecurringStore>()(
  devtools(
    persist(
      (set, get) => ({
        recurrings: [],
        isLoading: false,
        isProcessing: false,

        // TODO: Replace → GET /api/recurring
        fetchRecurring: async () => {
          await useRecurringStore.persist.rehydrate();
          set({ isLoading: false });
        },

        // TODO: Replace → POST /api/recurring
        addRecurring: async (input) => {
          const now = new Date().toISOString();
          const walletStore = useWalletStore.getState();
          const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
          const { toCurrency, toAmount } = resolveTransferFields(walletStore, input);

          const startDate = input.startDate.toISOString();
          const recurring: RecurringTransaction = {
            id: generateId(),
            name: input.name,
            amount: input.amount,
            currency: sourceCurrency,
            type: input.type,
            description: input.description || "",
            walletId: input.walletId,
            categoryId: input.type === "TRANSFER" ? null : input.categoryId || null,
            toWalletId: input.type === "TRANSFER" ? input.toWalletId || null : null,
            toAmount,
            toCurrency,
            frequency: input.frequency,
            interval: input.interval,
            startDate,
            endDate: input.endDate ? input.endDate.toISOString() : null,
            nextRunDate: startDate,
            lastRunDate: null,
            isActive: true,
            userId: MOCK_USER_ID,
            createdAt: now,
            updatedAt: now,
          };

          set((s) => ({ recurrings: [recurring, ...s.recurrings] }));
          return recurring;
        },

        // TODO: Replace → PATCH /api/recurring/[id]
        updateRecurring: async (id, input) => {
          const walletStore = useWalletStore.getState();
          const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
          const { toCurrency, toAmount } = resolveTransferFields(walletStore, input);

          const now = new Date().toISOString();
          set((s) => ({
            recurrings: s.recurrings.map((r) => {
              if (r.id !== id) return r;
              const newStartDate = input.startDate.toISOString();
              // If start date changed, reset nextRunDate
              const nextRunDate = newStartDate !== r.startDate ? newStartDate : r.nextRunDate;
              return {
                ...r,
                name: input.name,
                amount: input.amount,
                currency: sourceCurrency,
                type: input.type,
                description: input.description || "",
                walletId: input.walletId,
                categoryId: input.type === "TRANSFER" ? null : input.categoryId || null,
                toWalletId: input.type === "TRANSFER" ? input.toWalletId || null : null,
                toAmount,
                toCurrency,
                frequency: input.frequency,
                interval: input.interval,
                startDate: newStartDate,
                endDate: input.endDate ? input.endDate.toISOString() : null,
                nextRunDate,
                updatedAt: now,
              };
            }),
          }));
        },

        // TODO: Replace → DELETE /api/recurring/[id]
        deleteRecurring: async (id) => {
          set((s) => ({ recurrings: s.recurrings.filter((r) => r.id !== id) }));
        },

        toggleActive: async (id) => {
          set((s) => ({
            recurrings: s.recurrings.map((r) =>
              r.id === id
                ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() }
                : r,
            ),
          }));
        },

        processRecurringTransactions: async () => {
          set({ isProcessing: true });
          const result: ProcessResult = { processed: 0, created: 0, details: [] };
          const today = new Date();
          today.setHours(23, 59, 59, 999);

          const { recurrings } = get();
          const addTransaction = useTransactionStore.getState().addTransaction;
          const updatedRecurrings = [...recurrings];

          for (let i = 0; i < updatedRecurrings.length; i++) {
            const rec = updatedRecurrings[i];
            if (!rec.isActive) continue;

            // Check if expired
            if (rec.endDate && new Date(rec.endDate) < new Date()) continue;

            let nextRun = new Date(rec.nextRunDate);
            let count = 0;

            while (nextRun <= today && count < MAX_BATCH_SIZE) {
              // Check end date
              if (rec.endDate && nextRun > new Date(rec.endDate)) break;

              // Create the transaction
              await addTransaction({
                amount: rec.amount,
                type: rec.type,
                description: rec.description,
                date: nextRun,
                walletId: rec.walletId,
                categoryId: rec.categoryId || "",
                toWalletId: rec.toWalletId || undefined,
                toAmount: rec.toAmount ?? undefined,
              });

              count++;
              nextRun = calculateNextRunDate(nextRun, rec.frequency, rec.interval);
            }

            if (count > 0) {
              const now = new Date().toISOString();
              result.processed++;
              result.created += count;
              result.details.push({ name: rec.name, count });

              updatedRecurrings[i] = {
                ...rec,
                nextRunDate: nextRun.toISOString(),
                lastRunDate: now,
                updatedAt: now,
              };
            }
          }

          if (result.created > 0) {
            set({ recurrings: updatedRecurrings });
          }

          set({ isProcessing: false });
          return result;
        },
      }),
      {
        name: STORAGE_KEYS.recurring,
        skipHydration: true,
        partialize: (state) => ({ recurrings: state.recurrings }),
      },
    ),
    { name: "RecurringStore", enabled: process.env.NODE_ENV === "development" },
  ),
);
