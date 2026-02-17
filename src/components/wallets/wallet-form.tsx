"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { CurrencySelect } from "@/components/ui/currency-select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createWalletSchema } from "@/lib/validations/wallet";
import { WALLET_TYPES, WALLET_ICONS, PRESET_COLORS } from "@/lib/constants";
import { Wallet, WalletFormInput } from "@/types";
import { useWalletStore } from "@/stores/wallet-store";
import { useUIStore } from "@/stores/ui-store";
import { cn, mergeRefs } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { type CurrencyCode } from "@/lib/currencies";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";

interface WalletFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet?: Wallet | null;
}

export function WalletForm({ open, onOpenChange, wallet }: WalletFormProps) {
  const addWallet = useWalletStore((s) => s.addWallet);
  const updateWallet = useWalletStore((s) => s.updateWallet);
  const defaultCurrency = useUIStore((s) => s.defaultCurrency);
  const isEditing = !!wallet;
  const { t } = useTranslation();
  const autoFocusRef = useAutoFocus<HTMLInputElement>(open);

  const schema = useMemo(() => createWalletSchema(t), [t]);
  const form = useForm<WalletFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      type: "EWALLET",
      currency: defaultCurrency,
      balance: 0,
      icon: "CreditCard",
      color: "#6366f1",
    },
  });

  useEffect(() => {
    if (open) {
      if (wallet) {
        form.reset({
          name: wallet.name,
          type: wallet.type,
          currency: wallet.currency,
          balance: wallet.balance,
          icon: wallet.icon,
          color: wallet.color,
        });
      } else {
        form.reset({
          name: "",
          type: "EWALLET",
          currency: defaultCurrency,
          balance: 0,
          icon: "CreditCard",
          color: "#6366f1",
        });
      }
    }
  }, [open, wallet, form, defaultCurrency]);

  const onSubmit = async (data: WalletFormInput) => {
    try {
      if (isEditing) {
        await updateWallet(wallet.id, {
          name: data.name,
          type: data.type,
          icon: data.icon,
          color: data.color,
        });
        toast.success(t("wallet.updateSuccess"));
      } else {
        await addWallet(data);
        toast.success(t("wallet.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("wallet.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("wallet.editWallet") : t("wallet.addWallet")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("wallet.walletName")}</Label>
            <Input
              placeholder={t("wallet.walletNamePlaceholder")}
              {...form.register("name")}
              ref={mergeRefs(autoFocusRef, form.register("name").ref)}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.type")}</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as WalletFormInput["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_TYPES.map((wt) => (
                    <SelectItem key={wt.value} value={wt.value}>
                      {t(wt.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("common.currency")}</Label>
              <CurrencySelect
                value={form.watch("currency")}
                onValueChange={(val) => form.setValue("currency", val as CurrencyCode)}
                disabled={isEditing}
              />
              {form.formState.errors.currency && (
                <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("wallet.initialBalance")}</Label>
            <Controller
              control={form.control}
              name="balance"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={form.watch("currency")}
                  disabled={isEditing}
                  hasError={!!form.formState.errors.balance}
                />
              )}
            />
            {form.formState.errors.balance && (
              <p className="text-sm text-red-500">{form.formState.errors.balance.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("common.icon")}</Label>
            <div className="grid grid-cols-8 gap-2">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => form.setValue("icon", icon)}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-md border transition-colors",
                    form.watch("icon") === icon
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-accent/50",
                  )}
                >
                  <IconRenderer name={icon} className="h-5 w-5" />
                </button>
              ))}
            </div>
            {form.formState.errors.icon && (
              <p className="text-sm text-red-500">{form.formState.errors.icon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("common.color")}</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => form.setValue("color", color)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    form.watch("color") === color
                      ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                      : "",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {form.formState.errors.color && (
              <p className="text-sm text-red-500">{form.formState.errors.color.message}</p>
            )}
          </div>

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
