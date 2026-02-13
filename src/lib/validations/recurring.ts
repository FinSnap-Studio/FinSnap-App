import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createRecurringSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("validation.recurringNameRequired")).max(50, t("validation.recurringNameMax")),
    amount: z.coerce.number().positive(t("validation.amountPositive")),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    description: z.string().max(200).optional().default(""),
    walletId: z.string().min(1, t("validation.selectWallet")),
    categoryId: z.string().optional(),
    toWalletId: z.string().optional(),
    toAmount: z.coerce.number().positive(t("validation.destAmountPositive")).optional(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"], { message: t("validation.selectFrequency") }),
    interval: z.coerce.number().min(1, t("validation.intervalMin")).max(365, t("validation.intervalMax")),
    startDate: z.coerce.date({ message: t("validation.dateRequired") }),
    endDate: z.coerce.date().optional().nullable(),
  }).refine((d) => d.type === "TRANSFER" ? !!d.toWalletId : true, {
    message: t("validation.selectDestWallet"), path: ["toWalletId"],
  }).refine((d) => d.type !== "TRANSFER" ? !!d.categoryId : true, {
    message: t("validation.selectCategory"), path: ["categoryId"],
  }).refine((d) => d.type === "TRANSFER" ? d.walletId !== d.toWalletId : true, {
    message: t("validation.sameWallet"), path: ["toWalletId"],
  }).refine((d) => d.endDate ? d.endDate > d.startDate : true, {
    message: t("validation.endDateAfterStart"), path: ["endDate"],
  });
}
