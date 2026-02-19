"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TemplateBar } from "@/components/templates/template-bar";
import { TemplateForm } from "@/components/templates/template-form";
import { TemplateList } from "@/components/templates/template-list";
import { useTemplateStore } from "@/stores/template-store";
import { useTranslation } from "@/hooks/use-translation";
import type {
  TransactionFormInput,
  TransactionTemplate,
  TransactionTemplateFormInput,
} from "@/types";

export function FAB() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [templateValues, setTemplateValues] = useState<Partial<TransactionFormInput> | null>(null);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateListOpen, setTemplateListOpen] = useState(false);
  const [saveAsTemplateDefaults, setSaveAsTemplateDefaults] =
    useState<Partial<TransactionTemplateFormInput> | null>(null);

  const templates = useTemplateStore((s) => s.templates);
  const { t } = useTranslation();

  const handleFABClick = useCallback(() => {
    if (templates.length > 0) {
      setPickerOpen(true);
    } else {
      setTemplateValues(null);
      setFormOpen(true);
    }
  }, [templates.length]);

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
    setPickerOpen(false);
    setFormOpen(true);
  }, []);

  const handleBlankTransaction = useCallback(() => {
    setTemplateValues(null);
    setPickerOpen(false);
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
    setPickerOpen(false);
    setTemplateFormOpen(true);
  }, []);

  const handleManageTemplates = useCallback(() => {
    setPickerOpen(false);
    setTemplateListOpen(true);
  }, []);

  return (
    <>
      <Button
        onClick={handleFABClick}
        size="icon"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg z-20"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Template Picker Sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent className="overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>{t("transaction.addTransaction")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Button className="w-full" onClick={handleBlankTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              {t("transaction.addTransaction")}
            </Button>
            <TemplateBar
              wrap
              onApply={handleApplyTemplate}
              onAdd={handleAddTemplate}
              onManage={handleManageTemplates}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Transaction Form */}
      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        templateValues={templateValues}
        onSaveAsTemplate={handleSaveAsTemplate}
      />

      {/* Template Form (save as template) */}
      <TemplateForm
        open={templateFormOpen}
        onOpenChange={setTemplateFormOpen}
        defaultValues={saveAsTemplateDefaults}
      />

      {/* Template List (manage) */}
      <TemplateList open={templateListOpen} onOpenChange={setTemplateListOpen} />
    </>
  );
}
