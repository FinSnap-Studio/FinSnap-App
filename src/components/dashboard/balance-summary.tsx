"use client";

import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type CurrencyCode } from "@/lib/currencies";
import { useTranslation } from "@/hooks/use-translation";

export function BalanceSummary() {
  const wallets = useWalletStore((s) => s.wallets);
  const isLoading = useWalletStore((s) => s.isLoading);
  const transactions = useTransactionStore((s) => s.transactions);
  const { locale } = useTranslation();

  const now = useMemo(() => new Date(), []);

  const balances = useMemo(() => {
    const result: Record<string, number> = {};
    wallets
      .filter((w) => w.isActive)
      .forEach((w) => {
        result[w.currency] = (result[w.currency] || 0) + w.balance;
      });
    return result;
  }, [wallets]);

  const netChange = useMemo(() => {
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const prevDate = new Date(curYear, curMonth - 2, 1);
    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();

    let curIncome = 0,
      curExpense = 0,
      prevIncome = 0,
      prevExpense = 0;
    for (const t of transactions) {
      if (t.type !== "INCOME" && t.type !== "EXPENSE") continue;
      const d = new Date(t.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (m === curMonth && y === curYear) {
        if (t.type === "INCOME") curIncome += t.amount;
        else curExpense += t.amount;
      } else if (m === prevMonth && y === prevYear) {
        if (t.type === "INCOME") prevIncome += t.amount;
        else prevExpense += t.amount;
      }
    }

    const curNet = curIncome - curExpense;
    const prevNet = prevIncome - prevExpense;
    if (prevNet === 0) return null;
    return ((curNet - prevNet) / Math.abs(prevNet)) * 100;
  }, [transactions, now]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="px-5 py-4">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    );
  }

  const currencies = Object.keys(balances) as CurrencyCode[];

  return (
    <Card>
      <CardContent className="px-5 py-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          {formatDate(now.toISOString(), "EEEE, dd MMMM yyyy", locale)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Wallet className="h-5 w-5 text-primary" />
          {currencies.length <= 1 ? (
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(balances[currencies[0]] || 0, currencies[0])}
            </p>
          ) : (
            <div className="space-y-0.5">
              {currencies.map((cur, i) => (
                <p
                  key={cur}
                  className={`font-bold text-foreground ${i === 0 ? "text-2xl" : "text-lg"}`}
                >
                  {formatCurrency(balances[cur], cur)}
                </p>
              ))}
            </div>
          )}
          {netChange !== null && (
            <Badge variant={netChange >= 0 ? "default" : "destructive"} className="text-xs gap-0.5">
              {netChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {netChange >= 0 ? "+" : ""}
              {netChange.toFixed(0)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
