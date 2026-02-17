import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category, CategoryFormInput, TransactionType } from "@/types";
import { MOCK_CATEGORIES } from "@/data/mock-data";
import { generateId } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storage";
import { MOCK_USER_ID } from "@/lib/constants";

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (input: CategoryFormInput) => Promise<Category>;
  updateCategory: (id: string, input: Partial<CategoryFormInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoriesByType: (type: TransactionType) => Category[];
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,

      // TODO: Replace → GET /api/categories
      fetchCategories: async () => {
        set({ isLoading: true });
        await useCategoryStore.persist.rehydrate();
        // Seed defaults if first visit (same behavior as before)
        if (get().categories.length === 0) {
          set({ categories: [...MOCK_CATEGORIES] });
        }
        set({ isLoading: false });
      },

      // TODO: Replace → POST /api/categories
      addCategory: async (input) => {
        const now = new Date().toISOString();
        const category: Category = {
          id: generateId(),
          ...input,
          isDefault: false,
          userId: MOCK_USER_ID,
          createdAt: now,
        };
        set((s) => ({ categories: [category, ...s.categories] }));
        return category;
      },

      // TODO: Replace → PATCH /api/categories/[id]
      updateCategory: async (id, input) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...input } : c
          ),
        }));
      },

      // TODO: Replace → DELETE /api/categories/[id]
      deleteCategory: async (id) => {
        const cat = get().categories.find((c) => c.id === id);
        if (cat?.isDefault) return false;
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        }));
        return true;
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type);
      },
    }),
    {
      name: STORAGE_KEYS.categories,
      skipHydration: true,
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);
