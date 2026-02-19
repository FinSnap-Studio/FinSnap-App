"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { seedDemoData } from "@/lib/storage";

export function FinalCtaSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const ref = useScrollAnimation();

  const handleTryDemo = useCallback(async () => {
    setDemoLoading(true);
    await seedDemoData();
    await useAuthStore.getState().login("demo@finsnap.app", "demo");
    router.push("/dashboard");
  }, [router]);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent" />

      <div
        ref={ref}
        className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center landing-animate animate-fade-up"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.cta.title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{t("landing.cta.subtitle")}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              {t("landing.nav.goToDashboard")}
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={handleTryDemo}
                disabled={demoLoading}
                className="ring-primary/20 shadow-lg shadow-primary/25"
              >
                {demoLoading ? t("common.loading") : t("landing.cta.tryDemo")}
              </Button>
              <Button size="lg" variant="ghost" onClick={() => router.push("/login")}>
                {t("landing.cta.signIn")}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
