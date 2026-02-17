"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import { seedDemoData } from "@/lib/storage";

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleTryDemo = useCallback(async () => {
    setDemoLoading(true);
    await seedDemoData();
    await useAuthStore.getState().login("demo@finsnap.app", "demo");
    router.push("/dashboard");
  }, [router]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Badge
          variant="secondary"
          className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {t("landing.hero.badge")}
        </Badge>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-100">
          <span className="text-primary">{t("landing.hero.title")}</span>
        </h1>

        <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-muted-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-200">
          {t("landing.hero.tagline")}
        </p>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-300">
          {t("landing.hero.desc")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-400">
          {isAuthenticated ? (
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              {t("landing.nav.goToDashboard")}
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={handleTryDemo} disabled={demoLoading}>
                {demoLoading ? t("common.loading") : t("landing.hero.tryDemo")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
                {t("landing.hero.signIn")}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
