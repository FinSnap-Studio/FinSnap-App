"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { BookmarkPlus, CalendarIcon, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { cn, formatCurrency } from "@/lib/utils";
import { Transaction, TransactionFormInput, TransactionType } from "@/types";
import { useTransactionStore } from "@/stores/transaction-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";
import { getDateLocale } from "@/lib/i18n";
import { ReceiptUpload } from "@/components/transactions/receipt-upload";
import type { OCRResult } from "@/lib/mock-ocr";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  templateValues?: Partial<TransactionFormInput> | null;
  onSaveAsTemplate?: (values: TransactionFormInput) => void;
}

export function TransactionForm({ open, onOpenChange, transaction, templateValues, onSaveAsTemplate }: TransactionFormProps) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const defaultCurrency = useUIStore((s) => s.defaultCurrency);
  const { t, locale } = useTranslation();
  const amountRef = useAutoFocus<HTMLInputElement>(open);

  const isEditing = !!transaction;

  const schema = useMemo(() => createTransactionSchema(t), [t]);
  const form = useForm<TransactionFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: 0,
      type: "EXPENSE",
      description: "",
      date: new Date(),
      walletId: "",
      categoryId: "",
      toWalletId: "",
      toAmount: undefined,
    },
  });

  const watchType = form.watch("type");
  const watchWalletId = form.watch("walletId");
  const watchToWalletId = form.watch("toWalletId");
  const watchAmount = form.watch("amount");
  const watchToAmount = form.watch("toAmount");

  const sourceWallet = wallets.find((w) => w.id === watchWalletId);
  const destWallet = wallets.find((w) => w.id === watchToWalletId);
  const isCrossCurrency = !!(
    watchType === "TRANSFER" &&
    sourceWallet && destWallet &&
    sourceWallet.currency !== destWallet.currency
  );

  // Reset form when opened/closed or when editing a different transaction
  useEffect(() => {
    if (open) {
      if (transaction) {
        form.reset({
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          date: new Date(transaction.date),
          walletId: transaction.walletId,
          categoryId: transaction.categoryId || "",
          toWalletId: transaction.toWalletId || "",
          toAmount: transaction.toAmount ?? undefined,
        });
      } else if (templateValues) {
        form.reset({
          amount: templateValues.amount ?? 0,
          type: templateValues.type ?? "EXPENSE",
          description: templateValues.description ?? "",
          date: new Date(),
          walletId: templateValues.walletId ?? "",
          categoryId: templateValues.categoryId ?? "",
          toWalletId: templateValues.toWalletId ?? "",
          toAmount: templateValues.toAmount,
        });
      } else {
        form.reset({
          amount: 0,
          type: "EXPENSE",
          description: "",
          date: new Date(),
          walletId: "",
          categoryId: "",
          toWalletId: "",
          toAmount: undefined,
        });
      }
    }
  }, [open, transaction, templateValues, form]);

  const onTypeChange = (type: string) => {
    form.setValue("type", type as TransactionType);
    form.setValue("categoryId", "");
    form.setValue("toWalletId", "");
    form.setValue("toAmount", undefined);
  };

  const categories = getCategoriesByType(watchType === "TRANSFER" ? "EXPENSE" : watchType);

  const handleOCRResult = (result: OCRResult) => {
    form.setValue("type", result.type);
    form.setValue("amount", result.amount);
    form.setValue("description", result.description);
    form.setValue("date", result.date);
    form.setValue("categoryId", result.categoryId);
  };

  const onSubmit = async (data: TransactionFormInput) => {
    if (isCrossCurrency && !data.toAmount) {
      form.setError("toAmount", { message: t("transaction.crossCurrencyRequired") });
      return;
    }
    try {
      if (isEditing) {
        await updateTransaction(transaction.id, data);
        toast.success(t("transaction.updateSuccess"));
      } else {
        await addTransaction(data);
        toast.success(t("transaction.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("transaction.saveError"));
    }
  };

  const implicitRate = isCrossCurrency && watchAmount > 0 && watchToAmount && watchToAmount > 0
    ? watchAmount / watchToAmount
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>{isEditing ? t("transaction.editTransaction") : t("transaction.addTransaction")}</SheetTitle>
        </SheetHeader>

        {!isEditing && (
          <ReceiptUpload onResult={handleOCRResult} disabled={form.formState.isSubmitting} />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Type Tabs */}
          <Tabs value={watchType} onValueChange={onTypeChange}>
            <TabsList className="w-full">
              <TabsTrigger value="INCOME" className="flex-1">{t("common.income")}</TabsTrigger>
              <TabsTrigger value="EXPENSE" className="flex-1">{t("common.expense")}</TabsTrigger>
              <TabsTrigger value="TRANSFER" className="flex-1">{t("common.transfer")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-2">
            <Label>
              {isCrossCurrency
                ? t("transfer.amountSource", { currency: sourceWallet?.currency ?? "" })
                : t("common.amount")}
            </Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  ref={amountRef}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={sourceWallet?.currency ?? defaultCurrency}
                  className="text-lg"
                  hasError={!!form.formState.errors.amount}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Wallet + Category side-by-side (or Wallet full width for Transfer) */}
          {watchType !== "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("nav.wallets")}</Label>
                <Select
                  value={watchWalletId}
                  onValueChange={(val) => form.setValue("walletId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("transaction.selectWallet")} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.walletId && (
                  <p className="text-sm text-red-500">{form.formState.errors.walletId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("common.category")}</Label>
                <Select
                  value={form.watch("categoryId") || ""}
                  onValueChange={(val) => form.setValue("categoryId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("transaction.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
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
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("transfer.fromWallet")}</Label>
              <Select
                value={watchWalletId}
                onValueChange={(val) => form.setValue("walletId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("transaction.selectWallet")} />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.walletId && (
                <p className="text-sm text-red-500">{form.formState.errors.walletId.message}</p>
              )}
            </div>
          )}

          {/* To Wallet (only for Transfer) */}
          {watchType === "TRANSFER" && (
            <div className="space-y-2">
              <Label>{t("transaction.walletDest")}</Label>
              <Select
                value={form.watch("toWalletId") || ""}
                onValueChange={(val) => form.setValue("toWalletId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("transaction.selectWalletDest")} />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter((w) => w.id !== watchWalletId)
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.currency})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.formState.errors.toWalletId && (
                <p className="text-sm text-red-500">{form.formState.errors.toWalletId.message}</p>
              )}
            </div>
          )}

          {/* Cross-currency info + toAmount */}
          {isCrossCurrency && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>{t("transfer.crossCurrency", { from: sourceWallet?.currency ?? "", to: destWallet?.currency ?? "" })}</span>
              </div>
              <div className="space-y-2">
                <Label>{t("transfer.amountDest", { currency: destWallet?.currency ?? "" })}</Label>
                <Controller
                  control={form.control}
                  name="toAmount"
                  render={({ field }) => (
                    <CurrencyInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      currencyCode={destWallet?.currency ?? defaultCurrency}
                      hasError={!!form.formState.errors.toAmount}
                    />
                  )}
                />
                {form.formState.errors.toAmount && (
                  <p className="text-sm text-red-500">{form.formState.errors.toAmount.message}</p>
                )}
                {implicitRate && (
                  <p className="text-xs text-muted-foreground">
                    {t("transfer.rate", { dest: destWallet?.currency ?? "", rate: formatCurrency(implicitRate, sourceWallet?.currency) })}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Input
              placeholder={t("transaction.descPlaceholder")}
              {...form.register("description")}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t("common.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date")
                    ? format(form.watch("date"), "PPP", { locale: getDateLocale(locale) })
                    : t("common.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  locale={getDateLocale(locale)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.saving") : isEditing ? t("common.update") : t("common.save")}
          </Button>

          {!isEditing && onSaveAsTemplate && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => onSaveAsTemplate(form.getValues())}
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              {t("template.saveAsTemplate")}
            </Button>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
