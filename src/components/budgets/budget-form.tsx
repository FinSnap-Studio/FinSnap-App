"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createBudgetSchema } from "@/lib/validations/budget";
import { MONTH_VALUES } from "@/lib/constants";
import { getMonthName } from "@/lib/utils";
import { Budget, BudgetFormInput } from "@/types";
import { useBudgetStore } from "@/stores/budget-store";
import { useCategoryStore } from "@/stores/category-store";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";
import { type CurrencyCode } from "@/lib/currencies";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
}

export function BudgetForm({ open, onOpenChange, budget }: BudgetFormProps) {
  const { t, locale } = useTranslation();
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const { selectedMonth, selectedYear, budgets } = useBudgetStore();
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const defaultCurrency = useUIStore((s) => s.defaultCurrency);
  const amountRef = useAutoFocus<HTMLInputElement>(open);
  const isEditing = !!budget;

  const schema = useMemo(() => createBudgetSchema(t), [t]);

  const form = useForm<BudgetFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: 0,
      currency: defaultCurrency,
      categoryId: "",
      month: selectedMonth,
      year: selectedYear,
    },
  });

  useEffect(() => {
    if (open) {
      if (budget) {
        form.reset({
          amount: budget.amount,
          currency: budget.currency,
          categoryId: budget.categoryId,
          month: budget.month,
          year: budget.year,
        });
      } else {
        form.reset({
          amount: 0,
          currency: defaultCurrency,
          categoryId: "",
          month: selectedMonth,
          year: selectedYear,
        });
      }
    }
  }, [open, budget, form, selectedMonth, selectedYear, defaultCurrency]);

  // Categories that don't already have a budget this month (unless editing that same budget)
  const expenseCategories = getCategoriesByType("EXPENSE");
  const budgetedCategoryIds = budgets
    .filter((b) => b.month === selectedMonth && b.year === selectedYear)
    .map((b) => b.categoryId);

  const availableCategories = isEditing
    ? expenseCategories
    : expenseCategories.filter((c) => !budgetedCategoryIds.includes(c.id));

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      if (isEditing) {
        await updateBudget(budget.id, data.amount);
        toast.success(t("budget.updateSuccess"));
      } else {
        await addBudget(data);
        toast.success(t("budget.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("budget.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("budget.editBudget") : t("budget.addBudget")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.category")}</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(val) => form.setValue("categoryId", val)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("budget.selectExpenseCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("common.currency")}</Label>
              <CurrencySelect
                value={form.watch("currency")}
                onValueChange={(val) => form.setValue("currency", val as CurrencyCode)}
                disabled={isEditing}
              />
              {form.formState.errors.currency && (
                <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("budget.budgetAmount")}</Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  ref={amountRef}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={form.watch("currency")}
                  hasError={!!form.formState.errors.amount}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.month")}</Label>
              <Select
                value={String(form.watch("month"))}
                onValueChange={(val) => form.setValue("month", Number(val))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_VALUES.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getMonthName(m, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("common.year")}</Label>
              <Select
                value={String(form.watch("year"))}
                onValueChange={(val) => form.setValue("year", Number(val))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? t("common.saving")
              : isEditing
                ? t("common.update")
                : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
