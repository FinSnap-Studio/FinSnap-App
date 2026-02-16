import { useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { Transaction, CategoryExpense, DailyTotal, MonthlyTrend } from "@/types";

export function useRecentTransactions(limit = 5): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit),
    [transactions, limit]
  );
}

export function useMonthlyAmounts(
  type: "INCOME" | "EXPENSE",
  month: number,
  year: number
): Record<string, number> {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const result: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== type) continue;
      const d = new Date(t.date);
      if (d.getMonth() + 1 !== month || d.getFullYear() !== year) continue;
      result[t.currency] = (result[t.currency] || 0) + t.amount;
    }
    return result;
  }, [transactions, type, month, year]);
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function useExpenseByCategory(
  month: number,
  year: number
): (CategoryExpense & { fill: string })[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  return useMemo(() => {
    const expenses = transactions.filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const map = new Map<string, number>();
    for (const tx of expenses) {
      if (!tx.categoryId) continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
    }

    const result: (CategoryExpense & { fill: string })[] = [];
    for (const [catId, total] of map) {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        result.push({
          categoryId: catId,
          categoryName: cat.name,
          total,
          color: cat.color,
          icon: cat.icon,
          fill: CHART_COLORS[result.length % CHART_COLORS.length],
        });
      }
    }
    return result.sort((a, b) => b.total - a.total);
  }, [transactions, categories, month, year]);
}

export function useDailyTotals(month: number, year: number): DailyTotal[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = new Map<number, { income: number; expense: number }>();

    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap.set(day, { income: 0, expense: 0 });
    }

    for (const t of transactions) {
      const d = new Date(t.date);
      if (d.getMonth() + 1 !== month || d.getFullYear() !== year) continue;
      if (t.type !== "INCOME" && t.type !== "EXPENSE") continue;
      const day = d.getDate();
      const entry = dailyMap.get(day)!;
      if (t.type === "INCOME") entry.income += t.amount;
      else entry.expense += t.amount;
    }

    const result: DailyTotal[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const entry = dailyMap.get(day)!;
      result.push({
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        dayLabel: String(day),
        income: entry.income,
        expense: entry.expense,
      });
    }
    return result;
  }, [transactions, month, year]);
}

export function useMonthlyTrend(months: number): MonthlyTrend[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result: MonthlyTrend[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();

      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const d = new Date(t.date);
        if (d.getMonth() + 1 !== m || d.getFullYear() !== y) continue;
        if (t.type === "INCOME") income += t.amount;
        else if (t.type === "EXPENSE") expense += t.amount;
      }

      result.push({
        month: m,
        year: y,
        label: monthNames[m - 1],
        income,
        expense,
      });
    }
    return result;
  }, [transactions, months]);
}

export function useTransactionsByWallet(walletId: string): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(
    () =>
      transactions
        .filter((t) => t.walletId === walletId || t.toWalletId === walletId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, walletId]
  );
}
