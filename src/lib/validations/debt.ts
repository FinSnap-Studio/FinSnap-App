import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createDebtSchema(t: TFunction) {
  return z.object({
    type: z.enum(["DEBT", "RECEIVABLE"], { message: t("validation.selectType") }),
    personName: z.string().min(1, t("validation.personNameRequired")).max(50, t("validation.walletNameMax")),
    amount: z.coerce.number().positive(t("validation.amountPositive")),
    description: z.string().optional().default(""),
    dueDate: z.date().nullable().optional(),
    walletId: z.string().min(1, t("validation.selectWallet")),
    createInitialTransaction: z.boolean().default(false),
  });
}

export function createDebtPaymentSchema(t: TFunction, maxAmount: number) {
  return z.object({
    amount: z.coerce.number().positive(t("validation.amountPositive")).max(maxAmount, t("debt.paymentExceedsRemaining")),
    date: z.date({ message: t("validation.dateRequired") }),
    description: z.string().optional().default(""),
  });
}
