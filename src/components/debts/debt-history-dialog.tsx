"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Debt } from "@/types";
import { useTransactionStore } from "@/stores/transaction-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
}

export function DebtHistoryDialog({ open, onOpenChange, debt }: DebtHistoryDialogProps) {
  const { t, locale } = useTranslation();
  const transactions = useTransactionStore((s) => s.transactions);

  if (!debt) return null;

  const linkedTxs = debt.linkedTransactionIds
    .map((id) => transactions.find((tx) => tx.id === id))
    .filter(Boolean)
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("debt.historyTitle")} — {debt.personName}</DialogTitle>
        </DialogHeader>

        {linkedTxs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("debt.noHistory")}</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {linkedTxs.map((tx) => (
              <div key={tx!.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx!.description || "-"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx!.date, "dd MMM yyyy", locale)}</p>
                </div>
                <span className={tx!.type === "INCOME" ? "text-green-600 font-medium text-sm" : "text-red-600 font-medium text-sm"}>
                  {tx!.type === "INCOME" ? "+" : "-"}{formatCurrency(tx!.amount, tx!.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
