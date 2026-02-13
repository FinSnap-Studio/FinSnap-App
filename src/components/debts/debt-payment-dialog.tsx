"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createDebtPaymentSchema } from "@/lib/validations/debt";
import { cn, formatCurrency } from "@/lib/utils";
import { Debt, DebtPaymentInput } from "@/types";
import { useDebtStore } from "@/stores/debt-store";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";
import { getDateLocale } from "@/lib/i18n";

interface DebtPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
}

export function DebtPaymentDialog({ open, onOpenChange, debt }: DebtPaymentDialogProps) {
  const { t, locale } = useTranslation();
  const makePayment = useDebtStore((s) => s.makePayment);
  const amountRef = useAutoFocus<HTMLInputElement>(open);

  const remaining = debt ? debt.amount - debt.paidAmount : 0;

  const schema = useMemo(() => createDebtPaymentSchema(t, remaining), [t, remaining]);

  const form = useForm<DebtPaymentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: 0,
      date: new Date(),
      description: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && debt) {
      form.reset({ amount: 0, date: new Date(), description: "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debt]);

  if (!debt) return null;

  const title = debt.type === "DEBT"
    ? t("debt.paymentTitle", { name: debt.personName })
    : t("debt.collectionTitle", { name: debt.personName });

  const setQuickAmount = (pct: number) => {
    const amount = pct === 100 ? remaining : Math.round(remaining * pct / 100);
    form.setValue("amount", amount);
  };

  const onSubmit = async (data: DebtPaymentInput) => {
    try {
      await makePayment(debt.id, data);
      toast.success(t("debt.paymentSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("debt.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-2">
          {t("debt.remaining")}: <span className="font-semibold text-foreground">{formatCurrency(remaining, debt.currency)}</span>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label>{t("common.amount")}</Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  ref={amountRef}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={debt.currency}
                  hasError={!!form.formState.errors.amount}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(25)}>
              {t("debt.quickPay25")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(50)}>
              {t("debt.quickPay50")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(100)}>
              {t("debt.quickPayFull")}
            </Button>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t("common.date")}</Label>
            <Controller
              control={form.control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd MMM yyyy", { locale: getDateLocale(locale) }) : t("common.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => date && field.onChange(date)}
                      locale={getDateLocale(locale)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Input
              placeholder={t("transaction.descPlaceholder")}
              {...form.register("description")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.processing") : debt.type === "DEBT" ? t("debt.makePayment") : t("debt.collectPayment")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
