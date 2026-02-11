import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createCategorySchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t("validation.categoryNameRequired")).max(30, t("validation.categoryNameMax")),
    type: z.enum(["INCOME", "EXPENSE"], { message: t("validation.selectType") }),
    icon: z.string().min(1, t("validation.selectIcon")),
    color: z.string().min(1, t("validation.selectColor")),
  });
}
