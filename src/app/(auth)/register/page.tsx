"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createRegisterSchema } from "@/lib/validations/auth";
import { RegisterFormInput } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const schema = useMemo(() => createRegisterSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setLoading(true);
    try {
      const success = await registerUser(data.name, data.email, data.password);
      if (success) {
        toast.success(t("auth.registerSuccess"));
        router.push("/login");
      }
    } catch {
      toast.error(t("auth.registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
        <CardDescription>{t("auth.registerDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="register-name">{t("auth.name")}</Label>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">{t("auth.email")}</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="off"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">{t("auth.password")}</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder={t("auth.passwordPlaceholder")}
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              id="register-confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {t("auth.registering")}
              </span>
            ) : (
              t("auth.register")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
