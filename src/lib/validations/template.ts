import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createTemplateSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("validation.templateNameRequired")).max(50, t("validation.templateNameMax")),
    amount: z.coerce.number().min(0, t("validation.amountNonNegative")),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    description: z.string().max(200).optional().default(""),
    walletId: z.string().min(1, t("validation.selectWallet")),
    categoryId: z.string().optional(),
    toWalletId: z.string().optional(),
    toAmount: z.coerce.number().positive(t("validation.destAmountPositive")).optional(),
  }).refine((d) => d.type === "TRANSFER" ? !!d.toWalletId : true, {
    message: t("validation.selectDestWallet"), path: ["toWalletId"],
  }).refine((d) => d.type !== "TRANSFER" ? !!d.categoryId : true, {
    message: t("validation.selectCategory"), path: ["categoryId"],
  }).refine((d) => d.type === "TRANSFER" ? d.walletId !== d.toWalletId : true, {
    message: t("validation.sameWallet"), path: ["toWalletId"],
  });
}
