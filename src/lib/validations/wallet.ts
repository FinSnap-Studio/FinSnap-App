import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/currencies";
import type { TFunction } from "@/lib/i18n";

export function createWalletSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("validation.walletNameRequired")).max(50, t("validation.walletNameMax")),
    type: z.enum(["EWALLET", "BANK", "CASH"], { message: t("validation.selectWalletType") }),
    currency: z.enum(CURRENCY_CODES, { message: t("validation.selectCurrency") }),
    balance: z.coerce.number().min(0, t("validation.balanceNonNegative")),
    icon: z.string().min(1, t("validation.selectIcon")),
    color: z.string().min(1, t("validation.selectColor")),
  });
}
