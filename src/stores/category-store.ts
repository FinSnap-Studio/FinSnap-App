import { create } from "zustand";
import { Category, CategoryFormInput, TransactionType } from "@/types";
import { MOCK_CATEGORIES } from "@/data/mock-data";
import { generateId } from "@/lib/utils";
import { storageGet, storageSet, STORAGE_KEYS } from "@/lib/storage";

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (input: CategoryFormInput) => Promise<Category>;
  updateCategory: (id: string, input: Partial<CategoryFormInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoriesByType: (type: TransactionType) => Category[];
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,

  // TODO: Replace → GET /api/categories
  fetchCategories: async () => {
    set({ isLoading: true });
    const stored = storageGet<Category[]>(STORAGE_KEYS.categories);
    if (stored) {
      set({ categories: stored, isLoading: false });
    } else {
      // First visit — seed with default categories
      const defaults = [...MOCK_CATEGORIES];
      storageSet(STORAGE_KEYS.categories, defaults);
      set({ categories: defaults, isLoading: false });
    }
  },

  // TODO: Replace → POST /api/categories
  addCategory: async (input) => {
    const now = new Date().toISOString();
    const category: Category = {
      id: generateId(),
      ...input,
      isDefault: false,
      userId: "user-mock-001",
      createdAt: now,
    };
    set((s) => {
      const categories = [category, ...s.categories];
      storageSet(STORAGE_KEYS.categories, categories);
      return { categories };
    });
    return category;
  },

  // TODO: Replace → PATCH /api/categories/[id]
  updateCategory: async (id, input) => {
    set((s) => {
      const categories = s.categories.map((c) =>
        c.id === id ? { ...c, ...input } : c
      );
      storageSet(STORAGE_KEYS.categories, categories);
      return { categories };
    });
  },

  // TODO: Replace → DELETE /api/categories/[id]
  deleteCategory: async (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (cat?.isDefault) return false;
    set((s) => {
      const categories = s.categories.filter((c) => c.id !== id);
      storageSet(STORAGE_KEYS.categories, categories);
      return { categories };
    });
    return true;
  },

  getCategoriesByType: (type) => {
    return get().categories.filter((c) => c.type === type);
  },
}));
