"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RecurringTransaction, RecurringFrequency } from "@/types";
import { useRecurringStore } from "@/stores/recurring-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { formatCurrency, getTransactionColor, getTransactionSign } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { getDateLocale, type TFunction } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/id";
import { RecurringForm } from "./recurring-form";

const FREQ_LABEL_MAP: Record<RecurringFrequency, TranslationKey> = {
  daily: "recurring.frequencyDaily",
  weekly: "recurring.frequencyWeekly",
  monthly: "recurring.frequencyMonthly",
  yearly: "recurring.frequencyYearly",
};

const FREQ_UNIT_MAP: Record<RecurringFrequency, TranslationKey> = {
  daily: "recurring.unitDay",
  weekly: "recurring.unitWeek",
  monthly: "recurring.unitMonth",
  yearly: "recurring.unitYear",
};

function getFrequencyLabel(t: TFunction, frequency: RecurringFrequency, interval: number): string {
  if (interval === 1) {
    return t(FREQ_LABEL_MAP[frequency]);
  }
  return t("recurring.everyLabel", { interval, unit: t(FREQ_UNIT_MAP[frequency]) });
}

export function RecurringList() {
  const recurrings = useRecurringStore((s) => s.recurrings);
  const deleteRecurring = useRecurringStore((s) => s.deleteRecurring);
  const toggleActive = useRecurringStore((s) => s.toggleActive);
  const getWalletById = useWalletStore((s) => s.getWalletById);
  const categories = useCategoryStore((s) => s.categories);
  const { t, locale } = useTranslation();

  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [deletingRecurring, setDeletingRecurring] = useState<RecurringTransaction | null>(null);

  const handleDelete = async () => {
    if (!deletingRecurring) return;
    try {
      await deleteRecurring(deletingRecurring.id);
      toast.success(t("recurring.deleteSuccess"));
    } catch {
      toast.error(t("recurring.saveError"));
    }
    setDeletingRecurring(null);
  };

  const handleToggle = async (rec: RecurringTransaction) => {
    await toggleActive(rec.id);
  };

  if (recurrings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("recurring.emptyState")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recurrings.map((rec) => {
          const wallet = getWalletById(rec.walletId);
          const category = categories.find((c) => c.id === rec.categoryId);
          const dateLocale = getDateLocale(locale);

          return (
            <div
              key={rec.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{rec.name}</p>
                  <Badge variant={rec.isActive ? "default" : "secondary"} className="text-xs">
                    {rec.isActive ? t("recurring.active") : t("recurring.paused")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {rec.type === "TRANSFER" ? t("common.transfer") : (category?.name ?? "—")} ·{" "}
                  {wallet?.name ?? "—"}
                </p>
                <p className={`text-sm font-semibold ${getTransactionColor(rec.type)}`}>
                  {getTransactionSign(rec.type)}
                  {formatCurrency(rec.amount, wallet?.currency)}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{getFrequencyLabel(t, rec.frequency, rec.interval)}</span>
                  <span>
                    {t("recurring.nextRun")}:{" "}
                    {format(new Date(rec.nextRunDate), "dd MMM yyyy", { locale: dateLocale })}
                  </span>
                  {rec.lastRunDate && (
                    <span>
                      {t("recurring.lastRun")}:{" "}
                      {format(new Date(rec.lastRunDate), "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggle(rec)}>
                    {rec.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" /> {t("recurring.paused")}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> {t("recurring.active")}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditingRecurring(rec)}>
                    <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingRecurring(rec)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {/* Edit Recurring */}
      <RecurringForm
        open={!!editingRecurring}
        onOpenChange={(open) => !open && setEditingRecurring(null)}
        recurring={editingRecurring}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingRecurring}
        onOpenChange={(open) => !open && setDeletingRecurring(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("recurring.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("recurring.deleteDesc", { name: deletingRecurring?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
