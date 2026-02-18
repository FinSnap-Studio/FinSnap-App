"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_VALUES } from "@/lib/constants";
import { getMonthName } from "@/lib/utils";
import { useBudgetStore } from "@/stores/budget-store";
import { useCategoryStore } from "@/stores/category-store";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetForm } from "@/components/budgets/budget-form";
import { getBudgetStatus, formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function BudgetsPage() {
  const { t, locale } = useTranslation();
  const allBudgets = useBudgetStore((s) => s.budgets);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const selectedYear = useBudgetStore((s) => s.selectedYear);
  const setMonth = useBudgetStore((s) => s.setMonth);
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const categories = useCategoryStore((s) => s.categories);
  const [formOpen, setFormOpen] = useState(false);

  const budgets = useMemo(
    () => allBudgets.filter((b) => b.month === selectedMonth && b.year === selectedYear),
    [allBudgets, selectedMonth, selectedYear],
  );
  const limitBudgets = useMemo(
    () =>
      budgets.filter((b) => {
        const status = getBudgetStatus(b.spent, b.amount);
        return status === "warning" || status === "danger";
      }),
    [budgets],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("budget.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t("budget.addBudget")}
        </Button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-3">
        <Select
          value={String(selectedMonth)}
          onValueChange={(val) => setMonth(Number(val), selectedYear)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_VALUES.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {getMonthName(m, locale)}
                {m === currentMonth && selectedYear === currentYear
                  ? ` ${t("budget.currentMonth")}`
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(val) => setMonth(selectedMonth, Number(val))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Limit Alerts */}
      {limitBudgets.length > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              {t("budget.limitAlert", { count: limitBudgets.length })}
            </h3>
          </div>
          <div className="space-y-2">
            {limitBudgets.map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);
              const status = getBudgetStatus(b.spent, b.amount);
              const pct = Math.round((b.spent / b.amount) * 100);
              return (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{cat?.name}</span>
                  <span
                    className={
                      status === "danger"
                        ? "text-red-600 dark:text-red-400 font-semibold"
                        : "text-yellow-700 dark:text-yellow-400"
                    }
                  >
                    {formatCurrency(b.spent, b.currency)} / {formatCurrency(b.amount, b.currency)} (
                    {pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">{t("budget.emptyState")}</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("budget.addBudget")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}

      <BudgetForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
