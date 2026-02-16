import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { MOCK_USER } from "@/data/mock-data";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // TODO: Replace → NextAuth signIn
      login: async (email: string, _password: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const user = { ...MOCK_USER, email };
            set({ user, isAuthenticated: true, isLoading: false });
            resolve(true);
          }, 500);
        });
      },

      // TODO: Replace → fetch POST /api/auth/register
      register: async (_name: string, _email: string, _password: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 500);
        });
      },

      // TODO: Replace → NextAuth signOut
      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
        useAuthStore.persist.clearStorage();
      },

      // TODO: Replace → NextAuth useSession
      checkAuth: () => {
        // After auto-rehydration, user is already restored by persist
        const { user } = useAuthStore.getState();
        set({ isAuthenticated: !!user, isLoading: false });
      },
    }),
    {
      name: "finsnap-auth",
      partialize: (state) => ({ user: state.user }),
      // NO skipHydration — auto-rehydrate on load
    }
  )
);
