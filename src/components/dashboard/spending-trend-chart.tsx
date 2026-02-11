"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTransactionStore } from "@/stores/transaction-store";
import { useBudgetStore } from "@/stores/budget-store";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const chartConfig = {
  cumulative: {
    label: "Spending",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SpendingTrendChart() {
  const transactions = useTransactionStore((s) => s.transactions);
  const allBudgets = useBudgetStore((s) => s.budgets);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const selectedYear = useBudgetStore((s) => s.selectedYear);
  const { t } = useTranslation();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const dailyData = useMemo(() => {
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

    const result: { date: string; dayLabel: string; income: number; expense: number }[] = [];
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

  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return dailyData.map((d) => {
      cumulative += d.expense;
      return {
        ...d,
        cumulative,
      };
    });
  }, [dailyData]);

  const totalBudget = useMemo(() => {
    return allBudgets
      .filter((b) => b.month === selectedMonth && b.year === selectedYear)
      .reduce((sum, b) => sum + b.amount, 0);
  }, [allBudgets, selectedMonth, selectedYear]);

  const localConfig = useMemo(
    () => ({
      cumulative: {
        ...chartConfig.cumulative,
        label: t("common.expense"),
      },
    }),
    [t]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("dashboard.spendingTrend")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={localConfig} className="max-h-[250px] w-full">
          <AreaChart data={cumulativeData} accessibilityLayer>
            <defs>
              <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cumulative)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-cumulative)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tickFormatter={(v) => {
                const num = parseInt(v);
                if (num === 1 || num % 5 === 0) return v;
                return "";
              }}
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
            {totalBudget > 0 && (
              <ReferenceLine
                y={totalBudget}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: t("dashboard.budgetLine"),
                  position: "insideTopRight",
                  fill: "hsl(var(--destructive))",
                  fontSize: 11,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--color-cumulative)"
              fill="url(#fillCumulative)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
