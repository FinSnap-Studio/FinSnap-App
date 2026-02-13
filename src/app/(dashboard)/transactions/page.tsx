"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TemplateBar } from "@/components/templates/template-bar";
import { TemplateForm } from "@/components/templates/template-form";
import { TemplateList } from "@/components/templates/template-list";
import { RecurringList } from "@/components/recurring/recurring-list";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { useTranslation } from "@/hooks/use-translation";
import { TransactionFormInput, TransactionTemplate, TransactionTemplateFormInput } from "@/types";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "recurring">("transactions");
  const [formOpen, setFormOpen] = useState(false);
  const [recurringFormOpen, setRecurringFormOpen] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateListOpen, setTemplateListOpen] = useState(false);
  const [templateValues, setTemplateValues] = useState<Partial<TransactionFormInput> | null>(null);
  const [saveAsTemplateDefaults, setSaveAsTemplateDefaults] = useState<Partial<TransactionTemplateFormInput> | null>(null);
  const { t } = useTranslation();

  const handleApplyTemplate = useCallback((template: TransactionTemplate) => {
    setTemplateValues({
      type: template.type,
      amount: template.amount,
      description: template.description,
      walletId: template.walletId,
      categoryId: template.categoryId || "",
      toWalletId: template.toWalletId || undefined,
      toAmount: template.toAmount ?? undefined,
    });
    setFormOpen(true);
  }, []);

  const handleOpenNewTransaction = useCallback(() => {
    setTemplateValues(null);
    setFormOpen(true);
  }, []);

  const handleSaveAsTemplate = useCallback((values: TransactionFormInput) => {
    setSaveAsTemplateDefaults({
      type: values.type,
      amount: values.amount,
      description: values.description,
      walletId: values.walletId,
      categoryId: values.categoryId,
      toWalletId: values.toWalletId,
      toAmount: values.toAmount,
    });
    setTemplateFormOpen(true);
  }, []);

  const handleAddTemplate = useCallback(() => {
    setSaveAsTemplateDefaults(null);
    setTemplateFormOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("transaction.title")}</h1>
        {activeTab === "transactions" ? (
          <Button onClick={handleOpenNewTransaction}>
            <Plus className="h-4 w-4 mr-2" /> {t("transaction.addTransaction")}
          </Button>
        ) : (
          <Button onClick={() => setRecurringFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("recurring.addRecurring")}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "transactions" | "recurring")}>
        <TabsList>
          <TabsTrigger value="transactions">{t("recurring.tabTransactions")}</TabsTrigger>
          <TabsTrigger value="recurring">{t("recurring.tabRecurring")}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6 mt-4">
          <TemplateBar
            onApply={handleApplyTemplate}
            onAdd={handleAddTemplate}
            onManage={() => setTemplateListOpen(true)}
          />
          <TransactionFilters />
          <TransactionList />
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          <RecurringList />
        </TabsContent>
      </Tabs>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        templateValues={templateValues}
        onSaveAsTemplate={handleSaveAsTemplate}
      />

      <RecurringForm
        open={recurringFormOpen}
        onOpenChange={setRecurringFormOpen}
      />

      <TemplateForm
        open={templateFormOpen}
        onOpenChange={setTemplateFormOpen}
        defaultValues={saveAsTemplateDefaults}
      />

      <TemplateList
        open={templateListOpen}
        onOpenChange={setTemplateListOpen}
      />
    </div>
  );
}
