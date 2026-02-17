import type { TFunction } from "@/lib/i18n";

/**
 * Add standard transfer-related refinements to a schema that has
 * `type`, `walletId`, `toWalletId`, and `categoryId` fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withTransferRefinements(schema: { refine: (...args: any[]) => any }, t: TFunction) {
  return schema
    .refine((d: any) => (d.type === "TRANSFER" ? !!d.toWalletId : true), {
      message: t("validation.selectDestWallet"),
      path: ["toWalletId"],
    })
    .refine((d: any) => (d.type !== "TRANSFER" ? !!d.categoryId : true), {
      message: t("validation.selectCategory"),
      path: ["categoryId"],
    })
    .refine((d: any) => (d.type === "TRANSFER" ? d.walletId !== d.toWalletId : true), {
      message: t("validation.sameWallet"),
      path: ["toWalletId"],
    });
}
