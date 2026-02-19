import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  ShoppingList,
  ShoppingItem,
  ShoppingListFormInput,
  ShoppingItemFormInput,
  ShoppingListStatus,
  ShoppingItemStatus,
} from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";
import { useTransactionStore } from "./transaction-store";
import { useWalletStore } from "./wallet-store";

interface ShoppingStore {
  shoppingLists: ShoppingList[];
  isLoading: boolean;
  fetchShoppingLists: () => Promise<void>;
  addShoppingList: (input: ShoppingListFormInput) => Promise<ShoppingList>;
  updateShoppingList: (id: string, input: Partial<ShoppingListFormInput>) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<boolean>;
  archiveShoppingList: (id: string) => Promise<void>;
  addItem: (listId: string, input: ShoppingItemFormInput) => Promise<ShoppingItem>;
  updateItem: (
    listId: string,
    itemId: string,
    input: Partial<ShoppingItemFormInput>,
  ) => Promise<void>;
  removeItem: (listId: string, itemId: string) => Promise<boolean>;
  purchaseItem: (listId: string, itemId: string, actualPrice?: number) => Promise<void>;
  skipItem: (listId: string, itemId: string) => Promise<void>;
  purchaseAllRemaining: (listId: string) => Promise<number>;
  markItemPending: (listId: string, itemId: string) => Promise<void>;
}

function checkAutoComplete(list: ShoppingList): ShoppingListStatus {
  if (list.items.length === 0) return list.status;
  const allDone = list.items.every(
    (item) => item.status === "PURCHASED" || item.status === "SKIPPED",
  );
  return allDone ? "COMPLETED" : list.status;
}

export const useShoppingStore = create<ShoppingStore>()(
  devtools(
    persist(
      (set, get) => ({
        shoppingLists: [],
        isLoading: false,

        // TODO: Replace → GET /api/shopping-lists
        fetchShoppingLists: async () => {
          await useShoppingStore.persist.rehydrate();
          set({ isLoading: false });
        },

        // TODO: Replace → POST /api/shopping-lists
        addShoppingList: async (input) => {
          const walletStore = useWalletStore.getState();
          const currency = walletStore.getWalletCurrency(input.walletId);
          const now = new Date().toISOString();

          const list: ShoppingList = {
            id: generateId(),
            name: input.name,
            walletId: input.walletId,
            currency,
            status: "ACTIVE",
            items: [],
            defaultCategoryId: input.defaultCategoryId || null,
            userId: MOCK_USER_ID,
            createdAt: now,
            updatedAt: now,
          };

          set((s) => ({ shoppingLists: [list, ...s.shoppingLists] }));
          return list;
        },

        // TODO: Replace → PATCH /api/shopping-lists/[id]
        updateShoppingList: async (id, input) => {
          set((s) => ({
            shoppingLists: s.shoppingLists.map((list) => {
              if (list.id !== id) return list;
              return {
                ...list,
                ...(input.name !== undefined && { name: input.name }),
                ...(input.defaultCategoryId !== undefined && {
                  defaultCategoryId: input.defaultCategoryId || null,
                }),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },

        // TODO: Replace → DELETE /api/shopping-lists/[id]
        deleteShoppingList: async (id) => {
          const list = get().shoppingLists.find((l) => l.id === id);
          if (!list) return false;

          set((s) => ({ shoppingLists: s.shoppingLists.filter((l) => l.id !== id) }));
          return true;
        },

        archiveShoppingList: async (id) => {
          set((s) => ({
            shoppingLists: s.shoppingLists.map((list) =>
              list.id === id
                ? {
                    ...list,
                    status: "ARCHIVED" as ShoppingListStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : list,
            ),
          }));
        },

        // TODO: Replace → POST /api/shopping-lists/[id]/items
        addItem: async (listId, input) => {
          const now = new Date().toISOString();
          const item: ShoppingItem = {
            id: generateId(),
            name: input.name,
            quantity: input.quantity,
            estimatedPrice: input.estimatedPrice,
            actualPrice: null,
            categoryId: input.categoryId || null,
            status: "PENDING",
            linkedTransactionId: null,
            notes: input.notes || "",
            createdAt: now,
            updatedAt: now,
          };

          set((s) => ({
            shoppingLists: s.shoppingLists.map((list) => {
              if (list.id !== listId) return list;
              return {
                ...list,
                items: [...list.items, item],
                updatedAt: now,
              };
            }),
          }));

          return item;
        },

        // TODO: Replace → PATCH /api/shopping-lists/[listId]/items/[itemId]
        updateItem: async (listId, itemId, input) => {
          set((s) => ({
            shoppingLists: s.shoppingLists.map((list) => {
              if (list.id !== listId) return list;
              return {
                ...list,
                items: list.items.map((item) => {
                  if (item.id !== itemId) return item;
                  return {
                    ...item,
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.quantity !== undefined && { quantity: input.quantity }),
                    ...(input.estimatedPrice !== undefined && {
                      estimatedPrice: input.estimatedPrice,
                    }),
                    ...(input.categoryId !== undefined && {
                      categoryId: input.categoryId || null,
                    }),
                    ...(input.notes !== undefined && { notes: input.notes }),
                    updatedAt: new Date().toISOString(),
                  };
                }),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },

        // TODO: Replace → DELETE /api/shopping-lists/[listId]/items/[itemId]
        removeItem: async (listId, itemId) => {
          const list = get().shoppingLists.find((l) => l.id === listId);
          if (!list) return false;

          set((s) => ({
            shoppingLists: s.shoppingLists.map((l) => {
              if (l.id !== listId) return l;
              return {
                ...l,
                items: l.items.filter((item) => item.id !== itemId),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));

          return true;
        },

        // TODO: Replace → POST /api/shopping-lists/[listId]/items/[itemId]/purchase
        purchaseItem: async (listId, itemId, actualPrice) => {
          const list = get().shoppingLists.find((l) => l.id === listId);
          if (!list) return;

          const item = list.items.find((i) => i.id === itemId);
          if (!item) return;

          const amount = actualPrice ?? item.estimatedPrice * item.quantity;
          const description = `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""} — ${list.name}`;

          const tx = await useTransactionStore.getState().addTransaction({
            amount,
            type: "EXPENSE",
            description,
            date: new Date(),
            walletId: list.walletId,
            categoryId: item.categoryId || "",
          });

          set((s) => ({
            shoppingLists: s.shoppingLists.map((l) => {
              if (l.id !== listId) return l;
              const updated = {
                ...l,
                items: l.items.map((i) => {
                  if (i.id !== itemId) return i;
                  return {
                    ...i,
                    status: "PURCHASED" as ShoppingItemStatus,
                    actualPrice: amount,
                    linkedTransactionId: tx.id,
                    updatedAt: new Date().toISOString(),
                  };
                }),
                updatedAt: new Date().toISOString(),
              };
              return { ...updated, status: checkAutoComplete(updated) };
            }),
          }));
        },

        skipItem: async (listId, itemId) => {
          set((s) => ({
            shoppingLists: s.shoppingLists.map((l) => {
              if (l.id !== listId) return l;
              const updated = {
                ...l,
                items: l.items.map((i) => {
                  if (i.id !== itemId) return i;
                  return {
                    ...i,
                    status: "SKIPPED" as ShoppingItemStatus,
                    updatedAt: new Date().toISOString(),
                  };
                }),
                updatedAt: new Date().toISOString(),
              };
              return { ...updated, status: checkAutoComplete(updated) };
            }),
          }));
        },

        purchaseAllRemaining: async (listId) => {
          const list = get().shoppingLists.find((l) => l.id === listId);
          if (!list) return 0;

          const pendingItems = list.items.filter((item) => item.status === "PENDING");
          if (pendingItems.length === 0) return 0;

          // Create one transaction per item so each gets its own categoryId
          // and markItemPending() can delete them independently without corrupting siblings
          const txStore = useTransactionStore.getState();
          const purchasedMap = new Map<string, { txId: string; amount: number }>();

          for (const item of pendingItems) {
            const amount = item.estimatedPrice * item.quantity;
            const description = `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""} — ${list.name}`;
            const tx = await txStore.addTransaction({
              amount,
              type: "EXPENSE",
              description,
              date: new Date(),
              walletId: list.walletId,
              categoryId: item.categoryId || "",
            });
            purchasedMap.set(item.id, { txId: tx.id, amount });
          }

          const now = new Date().toISOString();
          set((s) => ({
            shoppingLists: s.shoppingLists.map((l) => {
              if (l.id !== listId) return l;
              const updated = {
                ...l,
                items: l.items.map((item) => {
                  const purchased = purchasedMap.get(item.id);
                  if (!purchased) return item;
                  return {
                    ...item,
                    status: "PURCHASED" as ShoppingItemStatus,
                    actualPrice: purchased.amount,
                    linkedTransactionId: purchased.txId,
                    updatedAt: now,
                  };
                }),
                updatedAt: now,
              };
              return { ...updated, status: checkAutoComplete(updated) };
            }),
          }));

          return pendingItems.length;
        },

        markItemPending: async (listId, itemId) => {
          const list = get().shoppingLists.find((l) => l.id === listId);
          if (!list) return;

          const item = list.items.find((i) => i.id === itemId);
          if (!item) return;

          if (item.status === "PURCHASED" && item.linkedTransactionId) {
            await useTransactionStore.getState().deleteTransaction(item.linkedTransactionId);
          }

          set((s) => ({
            shoppingLists: s.shoppingLists.map((l) => {
              if (l.id !== listId) return l;
              return {
                ...l,
                status: "ACTIVE" as ShoppingListStatus,
                items: l.items.map((i) => {
                  if (i.id !== itemId) return i;
                  return {
                    ...i,
                    status: "PENDING" as ShoppingItemStatus,
                    actualPrice: null,
                    linkedTransactionId: null,
                    updatedAt: new Date().toISOString(),
                  };
                }),
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        },
      }),
      {
        name: STORAGE_KEYS.shoppingLists,
        skipHydration: true,
        partialize: (state) => ({ shoppingLists: state.shoppingLists }),
      },
    ),
    { name: "ShoppingStore", enabled: process.env.NODE_ENV === "development" },
  ),
);
