import { z } from "zod";
import type { TFunction } from "@/lib/i18n";
import { withTransferRefinements } from "./shared";

export function createTransactionSchema(t: TFunction) {
  const base = z.object({
    amount: z.coerce.number().positive(t("validation.amountPositive")),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"], { error: t("validation.selectType") }),
    description: z.string().max(200).optional().default(""),
    date: z.date({ error: t("validation.dateRequired") }),
    walletId: z.string().min(1, t("validation.selectWallet")),
    categoryId: z.string().optional(),
    toWalletId: z.string().optional(),
    toAmount: z.coerce.number().positive(t("validation.destAmountPositive")).optional(),
  });
  return withTransferRefinements(base, t);
}
