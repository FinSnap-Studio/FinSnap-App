import { z } from "zod";
import type { TFunction } from "@/lib/i18n";
import { withTransferRefinements } from "./shared";

export function createTemplateSchema(t: TFunction) {
  const base = z.object({
    name: z
      .string()
      .min(1, t("validation.templateNameRequired"))
      .max(50, t("validation.templateNameMax")),
    amount: z.coerce.number().min(0, t("validation.amountNonNegative")),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"], { error: t("validation.selectType") }),
    description: z.string().max(200).optional().default(""),
    walletId: z.string().min(1, t("validation.selectWallet")),
    categoryId: z.string().optional(),
    toWalletId: z.string().optional(),
    toAmount: z.coerce.number().positive(t("validation.destAmountPositive")).optional(),
  });
  return withTransferRefinements(base, t);
}
