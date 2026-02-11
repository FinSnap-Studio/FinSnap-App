import { create } from "zustand";
import { Wallet, WalletFormInput } from "@/types";
import { type CurrencyCode } from "@/lib/currencies";
import { generateId } from "@/lib/utils";
import { storageGet, storageSet, STORAGE_KEYS } from "@/lib/storage";

interface WalletStore {
  wallets: Wallet[];
  isLoading: boolean;
  fetchWallets: () => Promise<void>;
  addWallet: (input: WalletFormInput) => Promise<Wallet>;
  updateWallet: (id: string, input: Partial<WalletFormInput>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  updateBalance: (id: string, amount: number, op: "add" | "subtract") => void;
  getWalletById: (id: string) => Wallet | undefined;
  getWalletCurrency: (id: string) => CurrencyCode;
  getTotalBalance: () => Record<string, number>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  isLoading: false,

  // TODO: Replace → GET /api/wallets
  fetchWallets: async () => {
    set({ isLoading: true });
    const stored = storageGet<Wallet[]>(STORAGE_KEYS.wallets);
    if (stored) {
      set({ wallets: stored, isLoading: false });
    } else {
      const empty: Wallet[] = [];
      storageSet(STORAGE_KEYS.wallets, empty);
      set({ wallets: empty, isLoading: false });
    }
  },

  // TODO: Replace → POST /api/wallets
  addWallet: async (input) => {
    const now = new Date().toISOString();
    const wallet: Wallet = {
      id: generateId(),
      ...input,
      isActive: true,
      userId: "user-mock-001",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const wallets = [...s.wallets, wallet];
      storageSet(STORAGE_KEYS.wallets, wallets);
      return { wallets };
    });
    return wallet;
  },

  // TODO: Replace → PATCH /api/wallets/[id]
  updateWallet: async (id, input) => {
    set((s) => {
      const wallets = s.wallets.map((w) =>
        w.id === id
          ? { ...w, ...input, updatedAt: new Date().toISOString() }
          : w
      );
      storageSet(STORAGE_KEYS.wallets, wallets);
      return { wallets };
    });
  },

  // TODO: Replace → DELETE /api/wallets/[id] (soft delete)
  deleteWallet: async (id) => {
    set((s) => {
      const wallets = s.wallets.map((w) =>
        w.id === id ? { ...w, isActive: false, updatedAt: new Date().toISOString() } : w
      );
      storageSet(STORAGE_KEYS.wallets, wallets);
      return { wallets };
    });
  },

  // Will be removed on API migration (server handles balance)
  updateBalance: (id, amount, op) => {
    set((s) => {
      const wallets = s.wallets.map((w) => {
        if (w.id !== id) return w;
        const newBalance = op === "add" ? w.balance + amount : w.balance - amount;
        return { ...w, balance: newBalance, updatedAt: new Date().toISOString() };
      });
      storageSet(STORAGE_KEYS.wallets, wallets);
      return { wallets };
    });
  },

  getWalletById: (id) => {
    return get().wallets.find((w) => w.id === id);
  },

  getWalletCurrency: (id) => {
    const wallet = get().wallets.find((w) => w.id === id);
    return wallet?.currency ?? "IDR";
  },

  getTotalBalance: () => {
    const balances: Record<string, number> = {};
    get()
      .wallets.filter((w) => w.isActive)
      .forEach((w) => {
        balances[w.currency] = (balances[w.currency] || 0) + w.balance;
      });
    return balances;
  },
}));
