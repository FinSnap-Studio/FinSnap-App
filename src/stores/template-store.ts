import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { TransactionTemplate, TransactionTemplateFormInput } from "@/types";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";

interface TemplateStore {
  templates: TransactionTemplate[];
  isLoading: boolean;
  fetchTemplates: () => Promise<void>;
  addTemplate: (input: TransactionTemplateFormInput) => Promise<TransactionTemplate>;
  updateTemplate: (id: string, input: Partial<TransactionTemplateFormInput>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    persist(
      (set) => ({
        templates: [],
        isLoading: false,

        // TODO: Replace → GET /api/templates
        fetchTemplates: async () => {
          await useTemplateStore.persist.rehydrate();
          set({ isLoading: false });
        },

        // TODO: Replace → POST /api/templates
        addTemplate: async (input) => {
          const now = new Date().toISOString();
          const template: TransactionTemplate = {
            id: generateId(),
            name: input.name,
            type: input.type,
            amount: input.amount,
            description: input.description,
            walletId: input.walletId,
            categoryId: input.categoryId || null,
            toWalletId: input.toWalletId || null,
            toAmount: input.toAmount ?? null,
            userId: MOCK_USER_ID,
            createdAt: now,
            updatedAt: now,
          };
          set((s) => ({ templates: [template, ...s.templates] }));
          return template;
        },

        // TODO: Replace → PATCH /api/templates/[id]
        updateTemplate: async (id, input) => {
          set((s) => ({
            templates: s.templates.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...input,
                    categoryId: input.categoryId ?? t.categoryId,
                    toWalletId: input.toWalletId ?? t.toWalletId,
                    toAmount: input.toAmount ?? t.toAmount,
                    updatedAt: new Date().toISOString(),
                  }
                : t,
            ),
          }));
        },

        // TODO: Replace → DELETE /api/templates/[id]
        deleteTemplate: async (id) => {
          set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
        },
      }),
      {
        name: STORAGE_KEYS.templates,
        skipHydration: true,
        partialize: (state) => ({ templates: state.templates }),
      },
    ),
    { name: "TemplateStore", enabled: process.env.NODE_ENV === "development" },
  ),
);
