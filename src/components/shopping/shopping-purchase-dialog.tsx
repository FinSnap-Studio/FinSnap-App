"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ShoppingItem, ShoppingList } from "@/types";
import { useShoppingStore } from "@/stores/shopping-store";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";

interface ShoppingPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShoppingItem | null;
  list: ShoppingList | null;
}

interface PurchaseFormData {
  actualPrice: number;
}

export function ShoppingPurchaseDialog({
  open,
  onOpenChange,
  item,
  list,
}: ShoppingPurchaseDialogProps) {
  const { t } = useTranslation();
  const purchaseItem = useShoppingStore((state) => state.purchaseItem);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PurchaseFormData>({
    defaultValues: {
      actualPrice: 0,
    },
  });

  useEffect(() => {
    if (open && item) {
      reset({
        actualPrice: item.estimatedPrice * item.quantity,
      });
    }
  }, [open, item, reset]);

  const onSubmit = async (data: PurchaseFormData) => {
    if (!item || !list) return;

    try {
      purchaseItem(list.id, item.id, data.actualPrice);
      toast.success(t("shopping.purchaseSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("shopping.saveError"));
    }
  };

  if (!item || !list) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shopping.purchaseConfirm")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("shopping.purchaseDesc")}</p>

          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("shopping.itemName")}:</span>
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("shopping.quantity")}:</span>
              <span className="font-medium">{item.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("shopping.estimatedPrice")}:</span>
              <span className="font-medium">
                {formatCurrency(item.estimatedPrice * item.quantity, list.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualPrice">{t("shopping.actualPrice")}</Label>
            <Controller
              name="actualPrice"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={list.currency}
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.processing") : t("shopping.purchase")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
