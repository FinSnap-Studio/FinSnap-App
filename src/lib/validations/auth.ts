import { z } from "zod";
import type { TFunction } from "@/lib/i18n";

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordMin")),
  });
}

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z.string().min(1, t("validation.nameRequired")).max(50),
      email: z.string().email(t("validation.emailInvalid")),
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });
}
