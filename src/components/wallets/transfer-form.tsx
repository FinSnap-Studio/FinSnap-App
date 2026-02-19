"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { cn, formatCurrency } from "@/lib/utils";
import { TransactionFormInput } from "@/types";
import { useTransactionStore } from "@/stores/transaction-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";
import { getDateLocale } from "@/lib/i18n";

interface TransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferForm({ open, onOpenChange }: TransferFormProps) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const defaultCurrency = useUIStore((s) => s.defaultCurrency);
  const { t, locale } = useTranslation();
  const amountRef = useAutoFocus<HTMLInputElement>(open);

  const schema = useMemo(() => createTransactionSchema(t), [t]);
  const form = useForm<TransactionFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: 0,
      type: "TRANSFER",
      description: "Transfer",
      date: new Date(),
      walletId: "",
      categoryId: "",
      toWalletId: "",
      toAmount: undefined,
    },
  });

  const watchWalletId = useWatch({ control: form.control, name: "walletId" });
  const watchToWalletId = useWatch({ control: form.control, name: "toWalletId" });
  const watchAmount = useWatch({ control: form.control, name: "amount" });
  const watchToAmount = useWatch({ control: form.control, name: "toAmount" });
  const watchDate = useWatch({ control: form.control, name: "date" });

  const sourceWallet = wallets.find((w) => w.id === watchWalletId);
  const destWallet = wallets.find((w) => w.id === watchToWalletId);
  const isCrossCurrency = !!(
    sourceWallet &&
    destWallet &&
    sourceWallet.currency !== destWallet.currency
  );

  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        type: "TRANSFER",
        description: "Transfer",
        date: new Date(),
        walletId: "",
        categoryId: "",
        toWalletId: "",
        toAmount: undefined,
      });
    }
  }, [open, form]);

  const onSubmit = async (data: TransactionFormInput) => {
    if (isCrossCurrency && !data.toAmount) {
      form.setError("toAmount", { message: t("transaction.crossCurrencyRequired") });
      return;
    }
    try {
      await addTransaction(data);
      toast.success(t("transfer.success"));
      onOpenChange(false);
    } catch {
      toast.error(t("transfer.error"));
    }
  };

  const implicitRate =
    isCrossCurrency && watchAmount > 0 && watchToAmount && watchToAmount > 0
      ? watchAmount / watchToAmount
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("transfer.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("transfer.fromWallet")}</Label>
            <Select
              value={watchWalletId}
              onValueChange={(val) => {
                form.setValue("walletId", val);
                if (watchToWalletId === val) {
                  form.setValue("toWalletId", "");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("transfer.selectSource")} />
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
            <Label>{t("transfer.toWallet")}</Label>
            <Select
              value={watchToWalletId || ""}
              onValueChange={(val) => form.setValue("toWalletId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("transfer.selectDest")} />
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

          {isCrossCurrency && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                {t("transfer.crossCurrency", {
                  from: sourceWallet?.currency ?? "",
                  to: destWallet?.currency ?? "",
                })}
              </span>
            </div>
          )}

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
                  hasError={!!form.formState.errors.amount}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {isCrossCurrency && (
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
                  {t("transfer.rate", {
                    dest: destWallet?.currency ?? "",
                    rate: formatCurrency(implicitRate, sourceWallet?.currency),
                  })}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Input placeholder="Transfer" {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label>{t("common.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchDate
                    ? format(watchDate, "PPP", { locale: getDateLocale(locale) })
                    : t("common.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watchDate}
                  onSelect={(date) => date && form.setValue("date", date)}
                  locale={getDateLocale(locale)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.processing") : t("common.transfer")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
