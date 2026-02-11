"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Scale, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactionStore } from "@/stores/transaction-store";
import { formatCurrency } from "@/lib/utils";
import { type CurrencyCode } from "@/lib/currencies";
import { useTranslation } from "@/hooks/use-translation";
import { type Transaction } from "@/types";

function getMonthlyByType(
  txs: Transaction[],
  type: "INCOME" | "EXPENSE",
  month: number,
  year: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const t of txs) {
    if (t.type !== type) continue;
    const d = new Date(t.date);
    if (d.getMonth() + 1 !== month || d.getFullYear() !== year) continue;
    result[t.currency] = (result[t.currency] || 0) + t.amount;
  }
  return result;
}

function renderAmounts(amounts: Record<string, number>, colorClass: string) {
  const currencies = Object.keys(amounts) as CurrencyCode[];
  if (currencies.length === 0) {
    return <p className={`text-xl font-bold mt-1 ${colorClass}`}>{formatCurrency(0)}</p>;
  }
  if (currencies.length === 1) {
    return (
      <p className={`text-xl font-bold mt-1 ${colorClass}`}>
        {formatCurrency(amounts[currencies[0]], currencies[0])}
      </p>
    );
  }
  return (
    <div className="mt-1 space-y-0.5">
      {currencies.map((cur) => (
        <p key={cur} className={`text-sm font-bold ${colorClass}`}>
          {formatCurrency(amounts[cur], cur)}
        </p>
      ))}
    </div>
  );
}

function ChangeIndicator({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (previous === 0) return null;
  const pctChange = ((current - previous) / Math.abs(previous)) * 100;
  const isUp = pctChange >= 0;

  return (
    <span className={`flex items-center gap-0.5 text-xs ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(pctChange).toFixed(0)}% {label}
    </span>
  );
}

export function MonthlySummary() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { t } = useTranslation();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const incomeMap = useMemo(() => getMonthlyByType(transactions, "INCOME", month, year), [transactions, month, year]);
  const expenseMap = useMemo(() => getMonthlyByType(transactions, "EXPENSE", month, year), [transactions, month, year]);

  const allCurrencies = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])] as CurrencyCode[];

  const balanceMap: Record<string, number> = {};
  for (const cur of allCurrencies) {
    balanceMap[cur] = (incomeMap[cur] || 0) - (expenseMap[cur] || 0);
  }

  const totalBalance = Object.values(balanceMap).reduce((sum, v) => sum + v, 0);
  const balanceColor = totalBalance >= 0 ? "text-green-600" : "text-red-600";

  const prev = useMemo(() => {
    const prevDate = new Date(year, month - 2, 1);
    const pm = prevDate.getMonth() + 1;
    const py = prevDate.getFullYear();
    const prevIncome = Object.values(getMonthlyByType(transactions, "INCOME", pm, py)).reduce((s, v) => s + v, 0);
    const prevExpense = Object.values(getMonthlyByType(transactions, "EXPENSE", pm, py)).reduce((s, v) => s + v, 0);
    return { income: prevIncome, expense: prevExpense, balance: prevIncome - prevExpense };
  }, [transactions, month, year]);

  const curTotals = useMemo(() => ({
    income: Object.values(incomeMap).reduce((s, v) => s + v, 0),
    expense: Object.values(expenseMap).reduce((s, v) => s + v, 0),
    balance: totalBalance,
  }), [incomeMap, expenseMap, totalBalance]);

  const vsLabel = t("dashboard.vsLastMonth");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-sm text-muted-foreground">{t("dashboard.monthlyIncome")}</p>
          </div>
          {renderAmounts(incomeMap, "text-green-600")}
          <ChangeIndicator current={curTotals.income} previous={prev.income} label={vsLabel} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <p className="text-sm text-muted-foreground">{t("dashboard.monthlyExpense")}</p>
          </div>
          {renderAmounts(expenseMap, "text-red-600")}
          <ChangeIndicator current={curTotals.expense} previous={prev.expense} label={vsLabel} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("dashboard.monthlyBalance")}</p>
          </div>
          {renderAmounts(balanceMap, balanceColor)}
          <ChangeIndicator current={curTotals.balance} previous={prev.balance} label={vsLabel} />
        </CardContent>
      </Card>
    </div>
  );
}
