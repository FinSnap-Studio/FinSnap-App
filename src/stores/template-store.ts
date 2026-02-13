import { create } from "zustand";
import { TransactionTemplate, TransactionTemplateFormInput } from "@/types";
import { generateId } from "@/lib/utils";
import { storageGet, storageSet, STORAGE_KEYS } from "@/lib/storage";

interface TemplateStore {
  templates: TransactionTemplate[];
  isLoading: boolean;
  fetchTemplates: () => Promise<void>;
  addTemplate: (input: TransactionTemplateFormInput) => Promise<TransactionTemplate>;
  updateTemplate: (id: string, input: Partial<TransactionTemplateFormInput>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  isLoading: false,

  // TODO: Replace → GET /api/templates
  fetchTemplates: async () => {
    set({ isLoading: true });
    const stored = storageGet<TransactionTemplate[]>(STORAGE_KEYS.templates);
    set({ templates: stored ?? [], isLoading: false });
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
      userId: "user-mock-001",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const templates = [template, ...s.templates];
      storageSet(STORAGE_KEYS.templates, templates);
      return { templates };
    });
    return template;
  },

  // TODO: Replace → PATCH /api/templates/[id]
  updateTemplate: async (id, input) => {
    set((s) => {
      const templates = s.templates.map((t) =>
        t.id === id
          ? {
              ...t,
              ...input,
              categoryId: input.categoryId ?? t.categoryId,
              toWalletId: input.toWalletId ?? t.toWalletId,
              toAmount: input.toAmount ?? t.toAmount,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      storageSet(STORAGE_KEYS.templates, templates);
      return { templates };
    });
  },

  // TODO: Replace → DELETE /api/templates/[id]
  deleteTemplate: async (id) => {
    set((s) => {
      const templates = s.templates.filter((t) => t.id !== id);
      storageSet(STORAGE_KEYS.templates, templates);
      return { templates };
    });
  },
}));
