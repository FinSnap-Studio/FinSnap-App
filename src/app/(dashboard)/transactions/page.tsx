"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTranslation } from "@/hooks/use-translation";

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("transaction.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t("transaction.addTransaction")}
        </Button>
      </div>

      <TransactionFilters />
      <TransactionList />
      <TransactionForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
