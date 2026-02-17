"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

const EARLY_FEATURES = [
  "landing.pricing.earlyFeature1",
  "landing.pricing.earlyFeature2",
  "landing.pricing.earlyFeature3",
  "landing.pricing.earlyFeature4",
  "landing.pricing.earlyFeature5",
  "landing.pricing.earlyFeature6",
  "landing.pricing.earlyFeature7",
] as const;

const PRO_FEATURES = [
  "landing.pricing.proFeature1",
  "landing.pricing.proFeature2",
  "landing.pricing.proFeature3",
  "landing.pricing.proFeature4",
  "landing.pricing.proFeature5",
  "landing.pricing.proFeature6",
] as const;

export function PricingSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const headerRef = useScrollAnimation();
  const earlyRef = useScrollAnimation();
  const proRef = useScrollAnimation();

  const handleCta = useCallback(async () => {
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }
    setDemoLoading(true);
    await useAuthStore.getState().login("demo@finsnap.app", "demo");
    router.push("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-14 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("landing.pricing.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Early Access Card */}
          <div ref={earlyRef} className="landing-animate animate-fade-up">
            <Card className="h-full border-primary shadow-md">
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mx-auto mb-3">{t("landing.pricing.earlyBadge")}</Badge>
                <CardTitle className="text-xl">{t("landing.pricing.earlyAccess")}</CardTitle>
                <p className="text-4xl font-bold text-primary mt-2">{t("landing.pricing.free")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("landing.pricing.earlySubtitle")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {EARLY_FEATURES.map((key) => (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary shrink-0" />
                      {t(key as TranslationKey)}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={handleCta} disabled={demoLoading}>
                  {demoLoading
                    ? t("common.loading")
                    : isAuthenticated
                      ? t("landing.nav.goToDashboard")
                      : t("landing.pricing.earlyCta")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pro Card */}
          <div
            ref={proRef}
            className="landing-animate animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <Card className="h-full opacity-75">
              <CardHeader className="text-center pb-2">
                <Badge variant="secondary" className="w-fit mx-auto mb-3">
                  {t("landing.pricing.proBadge")}
                </Badge>
                <CardTitle className="text-xl">{t("landing.pricing.pro")}</CardTitle>
                <p className="text-4xl font-bold text-muted-foreground mt-2">
                  {t("landing.pricing.proPrice")}
                </p>
                <p className="text-sm text-muted-foreground">{t("landing.pricing.proSubtitle")}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {PRO_FEATURES.map((key) => (
                    <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 shrink-0" />
                      {t(key as TranslationKey)}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="secondary" disabled>
                  {t("landing.pricing.proCta")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
