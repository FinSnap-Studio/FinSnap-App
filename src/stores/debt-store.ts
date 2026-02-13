import { create } from "zustand";
import { Debt, DebtFormInput, DebtPaymentInput, DebtType, DebtStatus } from "@/types";
import { generateId } from "@/lib/utils";
import { storageGet, storageSet, STORAGE_KEYS } from "@/lib/storage";

function calculateStatus(debt: Debt): DebtStatus {
  if (debt.paidAmount >= debt.amount) return "SETTLED";
  if (debt.dueDate && new Date(debt.dueDate) < new Date() && debt.paidAmount < debt.amount) return "OVERDUE";
  if (debt.paidAmount > 0) return "PARTIALLY_PAID";
  return "ACTIVE";
}

async function getOrCreateDebtCategory(type: "EXPENSE" | "INCOME", name: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useCategoryStore } = require("./category-store");
  const store = useCategoryStore.getState();
  const existing = store.categories.find(
    (c: { name: string; type: string }) => c.name === name && c.type === type
  );
  if (existing) return existing.id;

  const icon = type === "EXPENSE" ? "Banknote" : "Coins";
  const color = type === "EXPENSE" ? "#dc2626" : "#059669";
  const cat = await useCategoryStore.getState().addCategory({ name, type, icon, color });
  return cat.id;
}

interface DebtStore {
  debts: Debt[];
  isLoading: boolean;
  fetchDebts: () => Promise<void>;
  addDebt: (input: DebtFormInput) => Promise<Debt>;
  updateDebt: (id: string, input: Partial<DebtFormInput>) => Promise<void>;
  deleteDebt: (id: string) => Promise<boolean>;
  makePayment: (debtId: string, input: DebtPaymentInput) => Promise<void>;
  markAsSettled: (debtId: string) => Promise<void>;
  getDebtsByType: (type: DebtType) => Debt[];
  getActiveDebts: () => Debt[];
  getOverdueDebts: () => Debt[];
  getReminders: () => Debt[];
}

export const useDebtStore = create<DebtStore>((set, get) => ({
  debts: [],
  isLoading: false,

  // TODO: Replace → GET /api/debts
  fetchDebts: async () => {
    set({ isLoading: true });
    const stored = storageGet<Debt[]>(STORAGE_KEYS.debts);
    if (stored) {
      // Recalculate statuses on load (for overdue detection)
      const updated = stored.map((d) => ({ ...d, status: calculateStatus(d) }));
      storageSet(STORAGE_KEYS.debts, updated);
      set({ debts: updated, isLoading: false });
    } else {
      const empty: Debt[] = [];
      storageSet(STORAGE_KEYS.debts, empty);
      set({ debts: empty, isLoading: false });
    }
  },

  // TODO: Replace → POST /api/debts
  addDebt: async (input) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTransactionStore } = require("./transaction-store");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useWalletStore } = require("./wallet-store");
    const walletStore = useWalletStore.getState();
    const currency = walletStore.getWalletCurrency(input.walletId);
    const now = new Date().toISOString();

    const debt: Debt = {
      id: generateId(),
      type: input.type,
      personName: input.personName,
      amount: input.amount,
      paidAmount: 0,
      currency,
      description: input.description || "",
      dueDate: input.dueDate ? input.dueDate.toISOString() : null,
      status: "ACTIVE",
      walletId: input.walletId,
      linkedTransactionIds: [],
      userId: "user-mock-001",
      createdAt: now,
      updatedAt: now,
    };

    // Create initial transaction if requested
    if (input.createInitialTransaction) {
      const txType = input.type === "DEBT" ? "INCOME" : "EXPENSE";
      const categoryName = input.type === "DEBT" ? "Penerimaan Hutang" : "Piutang Diberikan";
      const categoryId = await getOrCreateDebtCategory(txType, categoryName);

      const tx = await useTransactionStore.getState().addTransaction({
        amount: input.amount,
        type: txType,
        description: input.description || `${input.type === "DEBT" ? "Hutang dari" : "Piutang ke"} ${input.personName}`,
        date: new Date(),
        walletId: input.walletId,
        categoryId,
      });
      debt.linkedTransactionIds.push(tx.id);
    }

    set((s) => {
      const debts = [debt, ...s.debts];
      storageSet(STORAGE_KEYS.debts, debts);
      return { debts };
    });

    return debt;
  },

  // TODO: Replace → PATCH /api/debts/[id]
  updateDebt: async (id, input) => {
    set((s) => {
      const debts = s.debts.map((d) => {
        if (d.id !== id) return d;
        const updated = {
          ...d,
          ...(input.personName !== undefined && { personName: input.personName }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.dueDate !== undefined && { dueDate: input.dueDate ? input.dueDate.toISOString() : null }),
          updatedAt: new Date().toISOString(),
        };
        return { ...updated, status: calculateStatus(updated) };
      });
      storageSet(STORAGE_KEYS.debts, debts);
      return { debts };
    });
  },

  // TODO: Replace → DELETE /api/debts/[id]
  deleteDebt: async (id) => {
    const debt = get().debts.find((d) => d.id === id);
    if (!debt) return false;

    set((s) => {
      const debts = s.debts.filter((d) => d.id !== id);
      storageSet(STORAGE_KEYS.debts, debts);
      return { debts };
    });
    return true;
  },

  // TODO: Replace → POST /api/debts/[id]/payments
  makePayment: async (debtId, input) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTransactionStore } = require("./transaction-store");
    const debt = get().debts.find((d) => d.id === debtId);
    if (!debt) return;

    // DEBT payment = EXPENSE (paying back), RECEIVABLE collection = INCOME (receiving money)
    const txType = debt.type === "DEBT" ? "EXPENSE" : "INCOME";
    const categoryName = debt.type === "DEBT" ? "Pembayaran Hutang" : "Penerimaan Piutang";
    const categoryId = await getOrCreateDebtCategory(txType, categoryName);

    const tx = await useTransactionStore.getState().addTransaction({
      amount: input.amount,
      type: txType,
      description: input.description || `${debt.type === "DEBT" ? "Bayar hutang ke" : "Terima piutang dari"} ${debt.personName}`,
      date: input.date,
      walletId: debt.walletId,
      categoryId,
    });

    set((s) => {
      const debts = s.debts.map((d) => {
        if (d.id !== debtId) return d;
        const updated = {
          ...d,
          paidAmount: d.paidAmount + input.amount,
          linkedTransactionIds: [...d.linkedTransactionIds, tx.id],
          updatedAt: new Date().toISOString(),
        };
        return { ...updated, status: calculateStatus(updated) };
      });
      storageSet(STORAGE_KEYS.debts, debts);
      return { debts };
    });
  },

  markAsSettled: async (debtId) => {
    set((s) => {
      const debts = s.debts.map((d) =>
        d.id === debtId
          ? { ...d, status: "SETTLED" as DebtStatus, paidAmount: d.amount, updatedAt: new Date().toISOString() }
          : d
      );
      storageSet(STORAGE_KEYS.debts, debts);
      return { debts };
    });
  },

  getDebtsByType: (type) => {
    return get().debts.filter((d) => d.type === type);
  },

  getActiveDebts: () => {
    return get().debts.filter((d) => d.status !== "SETTLED");
  },

  getOverdueDebts: () => {
    return get().debts.filter((d) => d.status === "OVERDUE");
  },

  getReminders: () => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return get().debts.filter((d) => {
      if (d.status === "SETTLED") return false;
      if (d.status === "OVERDUE") return true;
      if (d.dueDate) {
        const due = new Date(d.dueDate);
        return due <= sevenDays;
      }
      return false;
    });
  },
}));
