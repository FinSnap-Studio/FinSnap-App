"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebtStore } from "@/stores/debt-store";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export function DebtReminder() {
  const { t } = useTranslation();
  const debts = useDebtStore((s) => s.debts);

  const reminders = useMemo(() => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return debts.filter((d) => {
      if (d.status === "SETTLED") return false;
      if (d.status === "OVERDUE") return true;
      if (d.dueDate) {
        const due = new Date(d.dueDate);
        return due <= sevenDays;
      }
      return false;
    });
  }, [debts]);

  if (reminders.length === 0) return null;

  const overdue = reminders.filter((d) => d.status === "OVERDUE");
  const dueSoon = reminders.filter((d) => d.status !== "OVERDUE");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t("dashboard.debtReminders")}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/debts">
            {t("dashboard.viewDebts")} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdue.length > 0 && (
          <div className="space-y-2">
            {overdue.map((debt) => {
              const days = Math.abs(Math.ceil((new Date(debt.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={debt.id} className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{debt.personName}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">{t("debt.overdue", { days })}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <Badge variant="outline" className={debt.type === "DEBT" ? "border-red-300 text-red-600" : "border-green-300 text-green-600"}>
                      {debt.type === "DEBT" ? t("debt.typeDebt") : t("debt.typeReceivable")}
                    </Badge>
                    <p className="text-xs font-medium mt-1">{formatCurrency(debt.amount - debt.paidAmount, debt.currency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {dueSoon.length > 0 && (
          <div className="space-y-2">
            {dueSoon.map((debt) => {
              const days = Math.max(0, Math.ceil((new Date(debt.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={debt.id} className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{debt.personName}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {days === 0 ? t("debt.dueToday") : t("debt.dueSoon", { days })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <Badge variant="outline" className={debt.type === "DEBT" ? "border-red-300 text-red-600" : "border-green-300 text-green-600"}>
                      {debt.type === "DEBT" ? t("debt.typeDebt") : t("debt.typeReceivable")}
                    </Badge>
                    <p className="text-xs font-medium mt-1">{formatCurrency(debt.amount - debt.paidAmount, debt.currency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
