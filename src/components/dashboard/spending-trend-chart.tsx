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
import { useBudgetStore } from "@/stores/budget-store";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useDailyTotals } from "@/hooks/use-transaction-computed";

const chartConfig = {
  cumulative: {
    label: "Spending",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SpendingTrendChart() {
  const allBudgets = useBudgetStore((s) => s.budgets);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const selectedYear = useBudgetStore((s) => s.selectedYear);
  const { t } = useTranslation();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const dailyData = useDailyTotals(month, year);

  const cumulativeData = useMemo(() => {
    const result: ((typeof dailyData)[number] & { cumulative: number })[] = [];
    dailyData.reduce((sum, d) => {
      const next = sum + d.expense;
      result.push({ ...d, cumulative: next });
      return next;
    }, 0);
    return result;
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
    [t],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{t("dashboard.spendingTrend")}</CardTitle>
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
                <ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />
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
