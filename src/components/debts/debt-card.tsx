"use client";

import { MoreHorizontal, Banknote, HandCoins, CheckCircle, History, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface DebtCardProps {
  debt: Debt;
  onPayment: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onSettle: (debt: Debt) => void;
  onHistory: (debt: Debt) => void;
}

const statusConfig = {
  ACTIVE: { key: "debt.status.active" as const, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PARTIALLY_PAID: { key: "debt.status.partiallyPaid" as const, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  SETTLED: { key: "debt.status.settled" as const, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  OVERDUE: { key: "debt.status.overdue" as const, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function getDueDateText(dueDate: string | null, t: ReturnType<typeof useTranslation>["t"]): string | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return t("debt.overdue", { days: Math.abs(diffDays) });
  if (diffDays === 0) return t("debt.dueToday");
  return t("debt.dueSoon", { days: diffDays });
}

export function DebtCard({ debt, onPayment, onEdit, onDelete, onSettle, onHistory }: DebtCardProps) {
  const { t, locale } = useTranslation();
  const remaining = debt.amount - debt.paidAmount;
  const pct = debt.amount > 0 ? Math.round((debt.paidAmount / debt.amount) * 100) : 0;
  const status = statusConfig[debt.status];
  const dueDateText = getDueDateText(debt.dueDate, t);
  const isSettled = debt.status === "SETTLED";

  return (
    <Card className={isSettled ? "opacity-60" : undefined}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{debt.personName}</span>
              <Badge variant="outline" className={debt.type === "DEBT" ? "border-red-300 text-red-600 dark:text-red-400" : "border-green-300 text-green-600 dark:text-green-400"}>
                {debt.type === "DEBT" ? t("debt.typeDebt") : t("debt.typeReceivable")}
              </Badge>
            </div>
            <Badge variant="secondary" className={status.className}>
              {t(status.key)}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isSettled && (
                <DropdownMenuItem onClick={() => onPayment(debt)}>
                  {debt.type === "DEBT" ? <Banknote className="mr-2 h-4 w-4" /> : <HandCoins className="mr-2 h-4 w-4" />}
                  {debt.type === "DEBT" ? t("debt.makePayment") : t("debt.collectPayment")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onHistory(debt)}>
                <History className="mr-2 h-4 w-4" />
                {t("debt.viewHistory")}
              </DropdownMenuItem>
              {!isSettled && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(debt)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSettle(debt)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("debt.markSettled")}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(debt)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount + Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("debt.paid")}: {formatCurrency(debt.paidAmount, debt.currency)}</span>
            <span className="font-medium">{formatCurrency(debt.amount, debt.currency)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("debt.progress", { pct })}</span>
            <span>{t("debt.remaining")}: {formatCurrency(remaining, debt.currency)}</span>
          </div>
        </div>

        {/* Due date + description */}
        <div className="flex items-center justify-between text-xs">
          {debt.dueDate ? (
            <span className={debt.status === "OVERDUE" ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
              {formatDate(debt.dueDate, "dd MMM yyyy", locale)} {dueDateText && `(${dueDateText})`}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("debt.noDueDate")}</span>
          )}
        </div>

        {debt.description && (
          <p className="text-xs text-muted-foreground truncate">{debt.description}</p>
        )}

        {/* Quick action button */}
        {!isSettled && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onPayment(debt)}
          >
            {debt.type === "DEBT" ? <Banknote className="mr-2 h-4 w-4" /> : <HandCoins className="mr-2 h-4 w-4" />}
            {debt.type === "DEBT" ? t("debt.makePayment") : t("debt.collectPayment")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
