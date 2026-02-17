"use client";

import { Debt } from "@/types";
import { DebtCard } from "./debt-card";
import { useTranslation } from "@/hooks/use-translation";

interface DebtListProps {
  debts: Debt[];
  onPayment: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onSettle: (debt: Debt) => void;
  onHistory: (debt: Debt) => void;
}

export function DebtList({
  debts,
  onPayment,
  onEdit,
  onDelete,
  onSettle,
  onHistory,
}: DebtListProps) {
  const { t } = useTranslation();

  if (debts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("debt.emptyState")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          onPayment={onPayment}
          onEdit={onEdit}
          onDelete={onDelete}
          onSettle={onSettle}
          onHistory={onHistory}
        />
      ))}
    </div>
  );
}
