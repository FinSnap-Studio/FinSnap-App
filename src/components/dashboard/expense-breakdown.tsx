"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { IconRenderer } from "@/lib/icon-map";
import { useExpenseByCategory } from "@/hooks/use-transaction-computed";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ExpenseBreakdown() {
  const { t } = useTranslation();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const data = useExpenseByCategory(month, year);

  const totalExpense = useMemo(
    () => data.reduce((sum, d) => sum + d.total, 0),
    [data]
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, i) => {
      config[item.categoryId] = {
        label: item.categoryName,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("dashboard.expenseBreakdown")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("dashboard.noExpenses")}
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="categoryName"
                      formatter={(value) => formatCurrency(value as number)}
                      hideLabel
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="categoryName"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {data.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-lg font-bold"
                            >
                              {formatCurrency(totalExpense)}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {data.map((item) => {
                const pct = ((item.total / totalExpense) * 100).toFixed(1);
                return (
                  <div key={item.categoryId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <IconRenderer name={item.icon} className="h-3.5 w-3.5" color={item.color} />
                      <span className="text-foreground">{item.categoryName}</span>
                    </span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
