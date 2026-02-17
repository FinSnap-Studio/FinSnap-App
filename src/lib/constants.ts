import { LayoutDashboard, Wallet, ArrowLeftRight, Handshake, PiggyBank, Tag } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export const WALLET_TYPES = [
  { value: "EWALLET", label: "walletType.ewallet" as TranslationKey },
  { value: "BANK", label: "walletType.bank" as TranslationKey },
  { value: "CASH", label: "walletType.cash" as TranslationKey },
] as const;

export const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#0d9488",
  "#059669",
  "#2563eb",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#64748b",
  "#0891b2",
] as const;

export const WALLET_ICONS = [
  "CreditCard",
  "Smartphone",
  "Building2",
  "Banknote",
  "Coins",
  "CircleDollarSign",
  "Gem",
  "Landmark",
] as const;

export const EXPENSE_ICONS = [
  "UtensilsCrossed",
  "Car",
  "ShoppingCart",
  "Home",
  "Gamepad2",
  "Pill",
  "BookOpen",
  "Shirt",
  "Gift",
  "Scissors",
  "PawPrint",
  "Coffee",
] as const;

export const INCOME_ICONS = [
  "Coins",
  "Briefcase",
  "TrendingUp",
  "Gift",
  "Banknote",
  "Trophy",
  "BarChart3",
  "Laptop",
] as const;

export const NAV_ITEMS = [
  { label: "nav.dashboard" as TranslationKey, href: "/dashboard", icon: "LayoutDashboard" },
  { label: "nav.wallets" as TranslationKey, href: "/wallets", icon: "Wallet" },
  { label: "nav.transactions" as TranslationKey, href: "/transactions", icon: "ArrowLeftRight" },
  { label: "nav.debts" as TranslationKey, href: "/debts", icon: "Handshake" },
  { label: "nav.budgets" as TranslationKey, href: "/budgets", icon: "PiggyBank" },
  { label: "nav.categories" as TranslationKey, href: "/categories", icon: "Tag" },
] as const;

export const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

// Mock user ID — single source of truth until real auth is implemented
export const MOCK_USER_ID = "user-mock-001";

// Shared nav icon mapping used by sidebar and mobile-nav
export const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Handshake,
  PiggyBank,
  Tag,
};
