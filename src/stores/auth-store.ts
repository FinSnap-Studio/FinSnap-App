import { create } from "zustand";
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

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // TODO: Replace → NextAuth signIn
  login: async (email: string, _password: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = { ...MOCK_USER, email };
        localStorage.setItem("finsnap-auth", JSON.stringify(user));
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
    localStorage.removeItem("finsnap-auth");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  // TODO: Replace → NextAuth useSession
  checkAuth: () => {
    try {
      const stored = localStorage.getItem("finsnap-auth");
      if (stored) {
        const user = JSON.parse(stored) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      localStorage.removeItem("finsnap-auth");
      set({ isLoading: false });
    }
  },
}));
