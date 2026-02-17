import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/currencies";
import type { TFunction } from "@/lib/i18n";

export function createBudgetSchema(t: TFunction) {
  return z.object({
    amount: z.coerce.number().positive(t("validation.budgetPositive")),
    currency: z.enum(CURRENCY_CODES, { error: t("validation.selectCurrency") }),
    categoryId: z.string().min(1, t("validation.selectCategory")),
    month: z.coerce.number().min(1).max(12),
    year: z.coerce
      .number()
      .min(2020)
      .max(new Date().getFullYear() + 5),
  });
}
