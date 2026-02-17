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
import { createDebtSchema } from "@/lib/validations/debt";
import { cn } from "@/lib/utils";
import { Debt, DebtFormInput, DebtType } from "@/types";
import { useDebtStore } from "@/stores/debt-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useTranslation } from "@/hooks/use-translation";
import { getDateLocale } from "@/lib/i18n";

interface DebtFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: Debt | null;
}

export function DebtForm({ open, onOpenChange, debt }: DebtFormProps) {
  const { t, locale } = useTranslation();
  const addDebt = useDebtStore((s) => s.addDebt);
  const updateDebt = useDebtStore((s) => s.updateDebt);
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const isEditing = !!debt;

  const schema = useMemo(() => createDebtSchema(t), [t]);

  const form = useForm<DebtFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: "DEBT",
      personName: "",
      amount: 0,
      description: "",
      dueDate: null,
      walletId: "",
      createInitialTransaction: false,
    },
  });

  const watchType = useWatch({ control: form.control, name: "type" });
  const watchWalletId = useWatch({ control: form.control, name: "walletId" });
  const watchCreateTx = useWatch({ control: form.control, name: "createInitialTransaction" });
  const selectedWallet = wallets.find((w) => w.id === watchWalletId);

  useEffect(() => {
    if (open) {
      if (debt) {
        form.reset({
          type: debt.type,
          personName: debt.personName,
          amount: debt.amount,
          description: debt.description,
          dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
          walletId: debt.walletId,
          createInitialTransaction: false,
        });
      } else {
        form.reset({
          type: "DEBT",
          personName: "",
          amount: 0,
          description: "",
          dueDate: null,
          walletId: wallets[0]?.id || "",
          createInitialTransaction: false,
        });
      }
    }
  }, [open, debt, form, wallets]);

  const onSubmit = async (data: DebtFormInput) => {
    try {
      if (isEditing) {
        await updateDebt(debt.id, data);
        toast.success(t("debt.updateSuccess"));
      } else {
        await addDebt(data);
        toast.success(t("debt.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("debt.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("debt.editDebt") : t("debt.addDebt")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>{t("common.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["DEBT", "RECEIVABLE"] as DebtType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={watchType === type ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    watchType === type && type === "DEBT" && "bg-red-600 hover:bg-red-700",
                    watchType === type &&
                      type === "RECEIVABLE" &&
                      "bg-green-600 hover:bg-green-700",
                  )}
                  onClick={() => form.setValue("type", type)}
                  disabled={isEditing}
                >
                  {type === "DEBT" ? t("debt.typeDebt") : t("debt.typeReceivable")}
                </Button>
              ))}
            </div>
          </div>

          {/* Person name */}
          <div className="space-y-2">
            <Label>{t("debt.personName")}</Label>
            <Input
              placeholder={t("debt.personNamePlaceholder")}
              autoFocus
              {...form.register("personName")}
            />
            {form.formState.errors.personName && (
              <p className="text-sm text-red-500">{form.formState.errors.personName.message}</p>
            )}
          </div>

          {/* Wallet select */}
          <div className="space-y-2">
            <Label>Wallet</Label>
            <Select
              value={watchWalletId}
              onValueChange={(val) => form.setValue("walletId", val)}
              disabled={isEditing}
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

          {/* Amount */}
          <div className="space-y-2">
            <Label>{t("common.amount")}</Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={selectedWallet?.currency ?? "IDR"}
                  hasError={!!form.formState.errors.amount}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label>{t("debt.dueDate")}</Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "dd MMM yyyy", { locale: getDateLocale(locale) })
                        : t("debt.noDueDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={(date) => field.onChange(date ?? null)}
                      locale={getDateLocale(locale)}
                    />
                    {field.value && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => field.onChange(null)}
                        >
                          {t("debt.noDueDate")}
                        </Button>
                      </div>
                    )}
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

          {/* Create initial transaction */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchCreateTx}
                  onChange={(e) => form.setValue("createInitialTransaction", e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm">{t("debt.createInitialTransaction")}</span>
              </label>
              {watchCreateTx && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    {watchType === "DEBT" ? t("debt.helpDebt") : t("debt.helpReceivable")}
                  </span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? t("common.saving")
              : isEditing
                ? t("common.update")
                : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
