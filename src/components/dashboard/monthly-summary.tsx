"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Scale, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { type CurrencyCode } from "@/lib/currencies";
import { useTranslation } from "@/hooks/use-translation";
import { useMonthlyAmounts } from "@/hooks/use-transaction-computed";

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
  const { t } = useTranslation();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const incomeMap = useMonthlyAmounts("INCOME", month, year);
  const expenseMap = useMonthlyAmounts("EXPENSE", month, year);

  const allCurrencies = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])] as CurrencyCode[];

  const balanceMap: Record<string, number> = {};
  for (const cur of allCurrencies) {
    balanceMap[cur] = (incomeMap[cur] || 0) - (expenseMap[cur] || 0);
  }

  const totalBalance = Object.values(balanceMap).reduce((sum, v) => sum + v, 0);
  const balanceColor = totalBalance >= 0 ? "text-green-600" : "text-red-600";

  const prevDate = new Date(year, month - 2, 1);
  const pm = prevDate.getMonth() + 1;
  const py = prevDate.getFullYear();
  const prevIncomeMap = useMonthlyAmounts("INCOME", pm, py);
  const prevExpenseMap = useMonthlyAmounts("EXPENSE", pm, py);

  const prev = useMemo(() => {
    const prevIncome = Object.values(prevIncomeMap).reduce((s, v) => s + v, 0);
    const prevExpense = Object.values(prevExpenseMap).reduce((s, v) => s + v, 0);
    return { income: prevIncome, expense: prevExpense, balance: prevIncome - prevExpense };
  }, [prevIncomeMap, prevExpenseMap]);

  const curTotals = useMemo(() => {
    const income = Object.values(incomeMap).reduce((s, v) => s + v, 0);
    const expense = Object.values(expenseMap).reduce((s, v) => s + v, 0);
    return { income, expense, balance: income - expense };
  }, [incomeMap, expenseMap]);

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
