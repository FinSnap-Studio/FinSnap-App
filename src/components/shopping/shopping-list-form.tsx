"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShoppingList, ShoppingListFormInput } from "@/types";
import { useShoppingStore } from "@/stores/shopping-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTranslation } from "@/hooks/use-translation";
import { createShoppingListSchema } from "@/lib/validations/shopping";
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
import { toast } from "sonner";

interface ShoppingListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: ShoppingList | null;
}

export function ShoppingListForm({ open, onOpenChange, list }: ShoppingListFormProps) {
  const { t } = useTranslation();
  const addShoppingList = useShoppingStore((state) => state.addShoppingList);
  const updateShoppingList = useShoppingStore((state) => state.updateShoppingList);
  const allWallets = useWalletStore((state) => state.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => c.type === "EXPENSE"),
    [allCategories],
  );

  const schema = useMemo(() => createShoppingListSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingListFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      walletId: wallets[0]?.id || "",
      defaultCategoryId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (list) {
        reset({
          name: list.name,
          walletId: list.walletId,
          defaultCategoryId: list.defaultCategoryId || "",
        });
      } else {
        reset({
          name: "",
          walletId: wallets[0]?.id || "",
          defaultCategoryId: "",
        });
      }
    }
  }, [open, list, reset, wallets]);

  const onSubmit = async (data: ShoppingListFormInput) => {
    try {
      if (list) {
        await updateShoppingList(list.id, data);
        toast.success(t("shopping.updateSuccess"));
      } else {
        await addShoppingList(data);
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
          <DialogTitle>{list ? t("shopping.editList") : t("shopping.addList")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("shopping.listName")}</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder={t("shopping.listNamePlaceholder")}
                  autoFocus
                />
              )}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("shopping.wallet")}</Label>
            <Controller
              name="walletId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!!list}>
                  <SelectTrigger id="walletId">
                    <SelectValue placeholder={t("transaction.selectWallet")} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {list && (
              <p className="text-xs text-muted-foreground">{t("shopping.walletCannotChange")}</p>
            )}
            {errors.walletId && (
              <p className="text-sm text-destructive">{errors.walletId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultCategoryId">{t("shopping.defaultCategory")}</Label>
            <Controller
              name="defaultCategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="defaultCategoryId">
                    <SelectValue placeholder={t("shopping.noCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("shopping.noCategory")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : list ? t("common.update") : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
