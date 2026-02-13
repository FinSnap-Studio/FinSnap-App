"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createRecurringSchema } from "@/lib/validations/recurring";
import { cn, formatCurrency, mergeRefs } from "@/lib/utils";
import { RecurringTransaction, RecurringTransactionFormInput, TransactionType } from "@/types";
import { useRecurringStore } from "@/stores/recurring-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";
import { getDateLocale } from "@/lib/i18n";

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringTransaction | null;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", labelKey: "recurring.frequencyDaily" },
  { value: "weekly", labelKey: "recurring.frequencyWeekly" },
  { value: "monthly", labelKey: "recurring.frequencyMonthly" },
  { value: "yearly", labelKey: "recurring.frequencyYearly" },
] as const;

export function RecurringForm({ open, onOpenChange, recurring }: RecurringFormProps) {
  const addRecurring = useRecurringStore((s) => s.addRecurring);
  const updateRecurring = useRecurringStore((s) => s.updateRecurring);
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const defaultCurrency = useUIStore((s) => s.defaultCurrency);
  const { t, locale } = useTranslation();
  const nameRef = useAutoFocus<HTMLInputElement>(open);

  const isEditing = !!recurring;

  const schema = useMemo(() => createRecurringSchema(t), [t]);
  const form = useForm<RecurringTransactionFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      type: "EXPENSE",
      description: "",
      walletId: "",
      categoryId: "",
      toWalletId: "",
      toAmount: undefined,
      frequency: "monthly",
      interval: 1,
      startDate: new Date(),
      endDate: null,
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

  useEffect(() => {
    if (open) {
      if (recurring) {
        form.reset({
          name: recurring.name,
          amount: recurring.amount,
          type: recurring.type,
          description: recurring.description,
          walletId: recurring.walletId,
          categoryId: recurring.categoryId || "",
          toWalletId: recurring.toWalletId || "",
          toAmount: recurring.toAmount ?? undefined,
          frequency: recurring.frequency,
          interval: recurring.interval,
          startDate: new Date(recurring.startDate),
          endDate: recurring.endDate ? new Date(recurring.endDate) : null,
        });
      } else {
        form.reset({
          name: "",
          amount: 0,
          type: "EXPENSE",
          description: "",
          walletId: "",
          categoryId: "",
          toWalletId: "",
          toAmount: undefined,
          frequency: "monthly",
          interval: 1,
          startDate: new Date(),
          endDate: null,
        });
      }
    }
  }, [open, recurring, form]);

  const onTypeChange = (type: string) => {
    form.setValue("type", type as TransactionType);
    form.setValue("categoryId", "");
    form.setValue("toWalletId", "");
    form.setValue("toAmount", undefined);
  };

  const categories = getCategoriesByType(watchType === "TRANSFER" ? "EXPENSE" : watchType);

  const onSubmit = async (data: RecurringTransactionFormInput) => {
    if (isCrossCurrency && !data.toAmount) {
      form.setError("toAmount", { message: t("transaction.crossCurrencyRequired") });
      return;
    }
    try {
      if (isEditing) {
        await updateRecurring(recurring.id, data);
        toast.success(t("recurring.updateSuccess"));
      } else {
        await addRecurring(data);
        toast.success(t("recurring.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("recurring.saveError"));
    }
  };

  const implicitRate = isCrossCurrency && watchAmount > 0 && watchToAmount && watchToAmount > 0
    ? watchAmount / watchToAmount
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>{isEditing ? t("recurring.editRecurring") : t("recurring.addRecurring")}</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>{t("recurring.name")}</Label>
            <Input
              placeholder={t("recurring.namePlaceholder")}
              {...(() => { const { ref, ...rest } = form.register("name"); return rest; })()}
              ref={mergeRefs(nameRef, form.register("name").ref)}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

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

          {/* Wallet + Category */}
          {watchType !== "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wallet</Label>
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

          {/* To Wallet (Transfer only) */}
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

          {/* Scheduling Section */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base font-semibold">{t("recurring.scheduling")}</Label>

            {/* Frequency + Interval */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("recurring.frequency")}</Label>
                <Select
                  value={form.watch("frequency")}
                  onValueChange={(val) => form.setValue("frequency", val as RecurringTransactionFormInput["frequency"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("validation.selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.frequency && (
                  <p className="text-sm text-red-500">{form.formState.errors.frequency.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("recurring.interval")}</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  {...form.register("interval", { valueAsNumber: true })}
                />
                {form.formState.errors.interval && (
                  <p className="text-sm text-red-500">{form.formState.errors.interval.message}</p>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>{t("recurring.startDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("startDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("startDate")
                      ? format(form.watch("startDate"), "PPP", { locale: getDateLocale(locale) })
                      : t("common.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("startDate")}
                    onSelect={(date) => date && form.setValue("startDate", date)}
                    locale={getDateLocale(locale)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
              )}
            </div>

            {/* End Date (optional) */}
            <div className="space-y-2">
              <Label>{t("recurring.endDate")} <span className="text-muted-foreground text-xs">({t("recurring.neverEnds")})</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("endDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("endDate")
                      ? format(form.watch("endDate")!, "PPP", { locale: getDateLocale(locale) })
                      : t("common.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("endDate") ?? undefined}
                    onSelect={(date) => form.setValue("endDate", date ?? null)}
                    locale={getDateLocale(locale)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.endDate && (
                <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.saving") : isEditing ? t("common.update") : t("common.save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
