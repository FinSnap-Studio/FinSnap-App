import { useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { Transaction } from "@/types";

export function useFilteredTransactions(): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const filters = useTransactionStore((s) => s.filters);

  return useMemo(() => {
    let result = [...transactions];

    if (filters.type && filters.type !== "ALL") {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.walletId) {
      result = result.filter(
        (t) => t.walletId === filters.walletId || t.toWalletId === filters.walletId
      );
    }
    if (filters.categoryId) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.dateFrom) {
      result = result.filter((t) => new Date(t.date) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= endOfDay);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [transactions, filters]);
}
