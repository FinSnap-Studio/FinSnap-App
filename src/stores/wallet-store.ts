import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Wallet, WalletFormInput } from "@/types";
import { type CurrencyCode } from "@/lib/currencies";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";

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
}

export const useWalletStore = create<WalletStore>()(
  devtools(
    persist(
      (set, get) => ({
        wallets: [],
        isLoading: false,

        // TODO: Replace → GET /api/wallets
        fetchWallets: async () => {
          await useWalletStore.persist.rehydrate();
          set({ isLoading: false });
        },

        // TODO: Replace → POST /api/wallets
        addWallet: async (input) => {
          const now = new Date().toISOString();
          const wallet: Wallet = {
            id: generateId(),
            ...input,
            isActive: true,
            userId: MOCK_USER_ID,
            createdAt: now,
            updatedAt: now,
          };
          set((s) => ({ wallets: [...s.wallets, wallet] }));
          return wallet;
        },

        // TODO: Replace → PATCH /api/wallets/[id]
        updateWallet: async (id, input) => {
          set((s) => ({
            wallets: s.wallets.map((w) =>
              w.id === id ? { ...w, ...input, updatedAt: new Date().toISOString() } : w,
            ),
          }));
        },

        // TODO: Replace → DELETE /api/wallets/[id] (soft delete)
        deleteWallet: async (id) => {
          set((s) => ({
            wallets: s.wallets.map((w) =>
              w.id === id ? { ...w, isActive: false, updatedAt: new Date().toISOString() } : w,
            ),
          }));
        },

        // Will be removed on API migration (server handles balance)
        updateBalance: (id, amount, op) => {
          set((s) => ({
            wallets: s.wallets.map((w) => {
              if (w.id !== id) return w;
              const newBalance = op === "add" ? w.balance + amount : w.balance - amount;
              return { ...w, balance: newBalance, updatedAt: new Date().toISOString() };
            }),
          }));
        },

        getWalletById: (id) => {
          return get().wallets.find((w) => w.id === id);
        },

        getWalletCurrency: (id) => {
          const wallet = get().wallets.find((w) => w.id === id);
          return wallet?.currency ?? "IDR";
        },
      }),
      {
        name: STORAGE_KEYS.wallets,
        skipHydration: true,
        partialize: (state) => ({ wallets: state.wallets }),
      },
    ),
    { name: "WalletStore", enabled: process.env.NODE_ENV === "development" },
  ),
);
