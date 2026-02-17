import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createShoppingListSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(1, t("validation.shoppingListNameRequired"))
      .max(50, t("validation.shoppingListNameMax")),
    walletId: z.string().min(1, t("validation.selectWallet")),
  });
}

export function createShoppingItemSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(1, t("validation.shoppingItemNameRequired"))
      .max(100, t("validation.shoppingItemNameMax")),
    quantity: z.coerce.number().int().min(1, t("validation.quantityMin")),
    estimatedPrice: z.coerce.number().positive(t("validation.amountPositive")),
    categoryId: z.string().optional().default(""),
    notes: z.string().max(200).optional().default(""),
  });
}
