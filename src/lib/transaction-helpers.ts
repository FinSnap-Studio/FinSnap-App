import { type TransactionType } from "@/types";
import { type CurrencyCode } from "@/lib/currencies";

interface WalletStoreActions {
  updateBalance: (id: string, amount: number, op: "add" | "subtract") => void;
  getWalletCurrency: (id: string) => CurrencyCode;
}

interface BalanceEffectParams {
  type: TransactionType;
  walletId: string;
  amount: number;
  toWalletId?: string | null;
  toAmount?: number | null;
}

/**
 * Apply a transaction's effect on wallet balances.
 * INCOME → add to wallet, EXPENSE → subtract, TRANSFER → subtract source + add dest.
 */
export function applyTransactionEffect(
  walletStore: WalletStoreActions,
  params: BalanceEffectParams,
) {
  const { type, walletId, amount, toWalletId, toAmount } = params;
  if (type === "INCOME") {
    walletStore.updateBalance(walletId, amount, "add");
  } else if (type === "EXPENSE") {
    walletStore.updateBalance(walletId, amount, "subtract");
  } else if (type === "TRANSFER" && toWalletId) {
    walletStore.updateBalance(walletId, amount, "subtract");
    walletStore.updateBalance(toWalletId, toAmount ?? amount, "add");
  }
}

/**
 * Reverse a transaction's effect on wallet balances (for update/delete).
 */
export function reverseTransactionEffect(
  walletStore: WalletStoreActions,
  params: BalanceEffectParams,
) {
  const { type, walletId, amount, toWalletId, toAmount } = params;
  if (type === "INCOME") {
    walletStore.updateBalance(walletId, amount, "subtract");
  } else if (type === "EXPENSE") {
    walletStore.updateBalance(walletId, amount, "add");
  } else if (type === "TRANSFER" && toWalletId) {
    walletStore.updateBalance(walletId, amount, "add");
    walletStore.updateBalance(toWalletId, toAmount ?? amount, "subtract");
  }
}

/**
 * Resolve transfer currency/amount fields.
 * Returns { toCurrency, toAmount } for a transaction or recurring.
 */
export function resolveTransferFields(
  walletStore: WalletStoreActions,
  input: {
    type: TransactionType;
    walletId: string;
    toWalletId?: string;
    toAmount?: number;
  },
): { toCurrency: CurrencyCode | null; toAmount: number | null } {
  if (input.type !== "TRANSFER" || !input.toWalletId) {
    return { toCurrency: null, toAmount: null };
  }
  const sourceCurrency = walletStore.getWalletCurrency(input.walletId);
  const toCurrency = walletStore.getWalletCurrency(input.toWalletId);
  const toAmount = toCurrency !== sourceCurrency && input.toAmount ? input.toAmount : null;
  return { toCurrency, toAmount };
}
