"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useDebtStore } from "@/stores/debt-store";
import { DebtForm } from "@/components/debts/debt-form";
import { DebtList } from "@/components/debts/debt-list";
import { DebtPaymentDialog } from "@/components/debts/debt-payment-dialog";
import { DebtHistoryDialog } from "@/components/debts/debt-history-dialog";
import { Debt } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function DebtsPage() {
  const { t } = useTranslation();
  const debts = useDebtStore((s) => s.debts);
  const deleteDebt = useDebtStore((s) => s.deleteDebt);
  const markAsSettled = useDebtStore((s) => s.markAsSettled);

  const [formOpen, setFormOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [historyDebt, setHistoryDebt] = useState<Debt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);

  // Summary calculations
  const activeDebts = debts.filter((d) => d.type === "DEBT" && d.status !== "SETTLED");
  const activeReceivables = debts.filter((d) => d.type === "RECEIVABLE" && d.status !== "SETTLED");
  const overdueDebts = debts.filter((d) => d.status === "OVERDUE");

  const totalDebtAmount = activeDebts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalReceivableAmount = activeReceivables.reduce(
    (sum, d) => sum + (d.amount - d.paidAmount),
    0,
  );
  const debtCurrency = activeDebts[0]?.currency ?? "IDR";
  const receivableCurrency = activeReceivables[0]?.currency ?? "IDR";

  const allDebts = debts.filter((d) => d.type === "DEBT");
  const allReceivables = debts.filter((d) => d.type === "RECEIVABLE");

  const handleEdit = (debt: Debt) => {
    setEditDebt(debt);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteDebt(deleteTarget.id);
    if (ok) toast.success(t("debt.deleteSuccess"));
    setDeleteTarget(null);
  };

  const handleSettle = async (debt: Debt) => {
    await markAsSettled(debt.id);
    toast.success(t("debt.settledSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("debt.title")}</h1>
        <Button
          onClick={() => {
            setEditDebt(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> {t("debt.addDebt")}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("debt.totalDebts")}</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalDebtAmount, debtCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("debt.totalReceivables")}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalReceivableAmount, receivableCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("debt.overdueCount")}</p>
                <p className="text-lg font-bold">{overdueDebts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            {t("debt.tabAll")} ({debts.length})
          </TabsTrigger>
          <TabsTrigger value="debts">
            {t("debt.tabDebts")} ({allDebts.length})
          </TabsTrigger>
          <TabsTrigger value="receivables">
            {t("debt.tabReceivables")} ({allReceivables.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <DebtList
            debts={debts}
            onPayment={setPaymentDebt}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onSettle={handleSettle}
            onHistory={setHistoryDebt}
          />
        </TabsContent>
        <TabsContent value="debts" className="mt-4">
          <DebtList
            debts={allDebts}
            onPayment={setPaymentDebt}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onSettle={handleSettle}
            onHistory={setHistoryDebt}
          />
        </TabsContent>
        <TabsContent value="receivables" className="mt-4">
          <DebtList
            debts={allReceivables}
            onPayment={setPaymentDebt}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onSettle={handleSettle}
            onHistory={setHistoryDebt}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DebtForm open={formOpen} onOpenChange={setFormOpen} debt={editDebt} />
      <DebtPaymentDialog
        open={!!paymentDebt}
        onOpenChange={(open) => !open && setPaymentDebt(null)}
        debt={paymentDebt}
      />
      <DebtHistoryDialog
        open={!!historyDebt}
        onOpenChange={(open) => !open && setHistoryDebt(null)}
        debt={historyDebt}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("debt.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("debt.deleteDesc", { name: deleteTarget?.personName ?? "" })}
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
    </div>
  );
}
