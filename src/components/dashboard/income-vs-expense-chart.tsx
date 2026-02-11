"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTransactionStore } from "@/stores/transaction-store";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function IncomeVsExpenseChart() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { t } = useTranslation();

  const data = useMemo(() => {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result: { month: number; year: number; label: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
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
      result.push({ month: m, year: y, label: monthNames[m - 1], income, expense });
    }
    return result;
  }, [transactions]);

  const localConfig = useMemo(
    () => ({
      income: { ...chartConfig.income, label: t("common.income") },
      expense: { ...chartConfig.expense, label: t("common.expense") },
    }),
    [t]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("dashboard.incomeVsExpense")}
        </CardTitle>
        <CardDescription>{t("dashboard.last6Months")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={localConfig} className="max-h-[250px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                return String(v);
              }}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
