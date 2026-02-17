import { type CurrencyCode } from "@/lib/currencies";

export type WalletType = "EWALLET" | "BANK" | "CASH";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: CurrencyCode;
  balance: number;
  icon: string;
  color: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  description: string;
  date: string;
  userId: string;
  walletId: string;
  wallet?: Wallet;
  categoryId: string | null;
  category?: Category | null;
  toWalletId: string | null;
  toWallet?: Wallet | null;
  toAmount: number | null;
  toCurrency: CurrencyCode | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  spent: number;
  currency: CurrencyCode;
  month: number;
  year: number;
  userId: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface WalletFormInput {
  name: string;
  type: WalletType;
  currency: CurrencyCode;
  balance: number;
  icon: string;
  color: string;
}

export interface TransactionFormInput {
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
  walletId: string;
  categoryId: string;
  toWalletId?: string;
  toAmount?: number;
}

export interface BudgetFormInput {
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  month: number;
  year: number;
}

export interface CategoryFormInput {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface LoginFormInput {
  email: string;
  password: string;
}

export interface RegisterFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  total: number;
  color: string;
  icon: string;
}

export interface DailyTotal {
  date: string;
  dayLabel: string;
  income: number;
  expense: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  description: string;
  walletId: string;
  categoryId: string | null;
  toWalletId: string | null;
  toAmount: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTemplateFormInput {
  name: string;
  type: TransactionType;
  amount: number;
  description: string;
  walletId: string;
  categoryId: string;
  toWalletId?: string;
  toAmount?: number;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  description: string;
  walletId: string;
  categoryId: string | null;
  toWalletId: string | null;
  toAmount: number | null;
  toCurrency: CurrencyCode | null;
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  lastRunDate: string | null;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransactionFormInput {
  name: string;
  amount: number;
  type: TransactionType;
  description: string;
  walletId: string;
  categoryId: string;
  toWalletId?: string;
  toAmount?: number;
  frequency: RecurringFrequency;
  interval: number;
  startDate: Date;
  endDate?: Date | null;
}

export type DebtType = "DEBT" | "RECEIVABLE";
export type DebtStatus = "ACTIVE" | "PARTIALLY_PAID" | "SETTLED" | "OVERDUE";

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  amount: number;
  paidAmount: number;
  currency: CurrencyCode;
  description: string;
  dueDate: string | null;
  status: DebtStatus;
  walletId: string;
  linkedTransactionIds: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtFormInput {
  type: DebtType;
  personName: string;
  amount: number;
  description: string;
  dueDate?: Date | null;
  walletId: string;
  createInitialTransaction: boolean;
}

export interface DebtPaymentInput {
  amount: number;
  date: Date;
  description?: string;
}

export type ShoppingListStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ShoppingItemStatus = "PENDING" | "PURCHASED" | "SKIPPED";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice: number | null;
  categoryId: string | null;
  status: ShoppingItemStatus;
  linkedTransactionId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  walletId: string;
  currency: CurrencyCode;
  status: ShoppingListStatus;
  items: ShoppingItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListFormInput {
  name: string;
  walletId: string;
}

export interface ShoppingItemFormInput {
  name: string;
  quantity: number;
  estimatedPrice: number;
  categoryId: string;
  notes?: string;
}

export interface TransactionFilters {
  type?: TransactionType | "ALL";
  walletId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
