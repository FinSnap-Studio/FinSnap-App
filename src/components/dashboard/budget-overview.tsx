"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useBudgetStore } from "@/stores/budget-store";
import { useCategoryStore } from "@/stores/category-store";
import { formatCurrency, getBudgetStatus } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";

const chartConfig = {
  used: { label: "Used", color: "var(--chart-1)" },
} satisfies ChartConfig;

function getUtilizationColor(pct: number) {
  if (pct >= 90) return "hsl(var(--destructive))";
  if (pct >= 70) return "hsl(var(--chart-4))";
  return "hsl(var(--chart-2))";
}

export function BudgetOverview() {
  const allBudgets = useBudgetStore((s) => s.budgets);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const selectedYear = useBudgetStore((s) => s.selectedYear);
  const categories = useCategoryStore((s) => s.categories);
  const { t } = useTranslation();

  const budgets = allBudgets.filter((b) => b.month === selectedMonth && b.year === selectedYear);

  const { totalBudget, totalSpent, overallPct } = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    return { totalBudget, totalSpent, overallPct };
  }, [budgets]);

  const ringColor = getUtilizationColor(overallPct);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t("dashboard.budgetThisMonth")}</CardTitle>
        <Link
          href="/budgets"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {t("dashboard.manageBudget")} <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("dashboard.noBudget")}
          </p>
        ) : (
          <div className="space-y-4">
            {/* Overall budget radial */}
            <div className="flex items-center gap-3">
              <ChartContainer config={chartConfig} className="h-[100px] w-[100px] shrink-0">
                <RadialBarChart
                  innerRadius={35}
                  outerRadius={48}
                  data={[{ used: overallPct }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    dataKey="used"
                    cornerRadius={6}
                    fill={ringColor}
                    background={{ fill: "hsl(var(--muted))" }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-lg font-bold"
                  >
                    {overallPct.toFixed(0)}%
                  </text>
                </RadialBarChart>
              </ChartContainer>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t("dashboard.overallBudget")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: ringColor }}>
                  {t("dashboard.budgetUsed", { pct: overallPct.toFixed(0) })}
                </p>
              </div>
            </div>

            {/* Per-category progress bars */}
            <div className="space-y-2.5">
              {budgets.map((budget) => {
                const category = categories.find((c) => c.id === budget.categoryId);
                const pct = Math.min((budget.spent / budget.amount) * 100, 100);
                const status = getBudgetStatus(budget.spent, budget.amount);
                const barColor =
                  status === "danger"
                    ? "bg-red-500"
                    : status === "warning"
                      ? "bg-yellow-500"
                      : "bg-green-500";

                return (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        {category?.icon && (
                          <IconRenderer
                            name={category.icon}
                            className="h-4 w-4"
                            color={category.color}
                          />
                        )}
                        <span className="font-medium">{category?.name}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(budget.spent, budget.currency)} /{" "}
                        {formatCurrency(budget.amount, budget.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
