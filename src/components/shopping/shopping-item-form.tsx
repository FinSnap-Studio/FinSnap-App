"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShoppingItem, ShoppingItemFormInput } from "@/types";
import type { CurrencyCode } from "@/lib/currencies";
import { useShoppingStore } from "@/stores/shopping-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTranslation } from "@/hooks/use-translation";
import { createShoppingItemSchema } from "@/lib/validations/shopping";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";

interface ShoppingItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  item?: ShoppingItem | null;
  currency: CurrencyCode;
}

export function ShoppingItemForm({
  open,
  onOpenChange,
  listId,
  item,
  currency,
}: ShoppingItemFormProps) {
  const { t } = useTranslation();
  const addItem = useShoppingStore((state) => state.addItem);
  const updateItem = useShoppingStore((state) => state.updateItem);
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => c.type === "EXPENSE"),
    [allCategories],
  );

  const schema = useMemo(() => createShoppingItemSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingItemFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      quantity: 1,
      estimatedPrice: 0,
      categoryId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
          categoryId: item.categoryId || "",
          notes: item.notes || "",
        });
      } else {
        reset({
          name: "",
          quantity: 1,
          estimatedPrice: 0,
          categoryId: "",
          notes: "",
        });
      }
    }
  }, [open, item, reset]);

  const onSubmit = async (data: ShoppingItemFormInput) => {
    try {
      if (item) {
        updateItem(listId, item.id, data);
        toast.success(t("shopping.updateSuccess"));
      } else {
        addItem(listId, data);
        toast.success(t("shopping.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("shopping.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? t("shopping.editItem") : t("shopping.addItem")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("shopping.itemName")}</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder={t("shopping.itemNamePlaceholder")}
                  autoFocus
                />
              )}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("shopping.quantity")}</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="quantity"
                  type="number"
                  min={1}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              )}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedPrice">{t("shopping.estimatedPrice")}</Label>
            <Controller
              name="estimatedPrice"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  currencyCode={currency}
                  hasError={!!errors.estimatedPrice}
                />
              )}
            />
            {errors.estimatedPrice && (
              <p className="text-sm text-destructive">{errors.estimatedPrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">{t("common.category")}</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder={t("transaction.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.description")}</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input {...field} id="notes" placeholder={t("transaction.descPlaceholder")} />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : item ? t("common.update") : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
