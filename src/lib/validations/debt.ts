import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createDebtSchema(t: TFunction) {
  return z.object({
    type: z.enum(["DEBT", "RECEIVABLE"], { error: t("validation.selectType") }),
    personName: z
      .string()
      .min(1, t("validation.personNameRequired"))
      .max(50, t("validation.personNameMax")),
    amount: z.coerce.number().positive(t("validation.amountPositive")),
    description: z.string().max(200).optional().default(""),
    dueDate: z.date().nullable().optional(),
    walletId: z.string().min(1, t("validation.selectWallet")),
    createInitialTransaction: z.boolean().default(false),
  });
}

export function createDebtPaymentSchema(t: TFunction, maxAmount: number) {
  return z.object({
    amount: z.coerce
      .number()
      .positive(t("validation.amountPositive"))
      .max(maxAmount, t("debt.paymentExceedsRemaining")),
    date: z.date({ error: t("validation.dateRequired") }),
    description: z.string().max(200).optional().default(""),
  });
}
