import { z } from "zod";
import type { TFunction } from "@/lib/i18n";
import { withTransferRefinements } from "./shared";

export function createRecurringSchema(t: TFunction) {
  const base = z.object({
    name: z.string().min(1, t("validation.recurringNameRequired")).max(50, t("validation.recurringNameMax")),
    amount: z.coerce.number().positive(t("validation.amountPositive")),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"], { error: t("validation.selectType") }),
    description: z.string().max(200).optional().default(""),
    walletId: z.string().min(1, t("validation.selectWallet")),
    categoryId: z.string().optional(),
    toWalletId: z.string().optional(),
    toAmount: z.coerce.number().positive(t("validation.destAmountPositive")).optional(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"], { error: t("validation.selectFrequency") }),
    interval: z.coerce.number().min(1, t("validation.intervalMin")).max(365, t("validation.intervalMax")),
    startDate: z.coerce.date({ error: t("validation.dateRequired") }),
    endDate: z.coerce.date().optional().nullable(),
  }).refine((d) => d.endDate ? d.endDate > d.startDate : true, {
    message: t("validation.endDateAfterStart"), path: ["endDate"],
  });
  return withTransferRefinements(base, t);
}
