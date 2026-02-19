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
  "landing.pricing.earlyFeature8",
  "landing.pricing.earlyFeature9",
  "landing.pricing.earlyFeature10",
  "landing.pricing.earlyFeature11",
] as const;

const PRO_FEATURES = [
  "landing.pricing.proFeature1",
  "landing.pricing.proFeature2",
  "landing.pricing.proFeature3",
  "landing.pricing.proFeature4",
  "landing.pricing.proFeature5",
  "landing.pricing.proFeature6",
] as const;

function BillingToggle({
  billing,
  onChange,
}: {
  billing: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-full border bg-muted/50 p-1 mb-10">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          billing === "monthly"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("landing.pricing.monthly")}
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
          billing === "annual"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("landing.pricing.annual")}
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            billing === "annual"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {t("landing.pricing.annualSave")}
        </span>
      </button>
    </div>
  );
}

export function PricingSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
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
        <div ref={headerRef} className="text-center mb-4 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("landing.pricing.subtitle")}</p>
        </div>

        <div className="flex justify-center">
          <BillingToggle billing={billing} onChange={setBilling} />
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
            <Card className="relative h-full opacity-75">
              {billing === "annual" && (
                <Badge className="absolute -top-2.5 right-4">
                  {t("landing.pricing.bestValue")}
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <Badge variant="secondary" className="w-fit mx-auto mb-3">
                  {t("landing.pricing.proBadge")}
                </Badge>
                <CardTitle className="text-xl">{t("landing.pricing.pro")}</CardTitle>
                <p className="text-4xl font-bold text-muted-foreground mt-2">
                  {t("landing.pricing.proPrice")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {billing === "monthly"
                    ? t("landing.pricing.monthlySubtitle")
                    : t("landing.pricing.annualSubtitle")}
                </p>
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

        {/* Free note */}
        <p className="text-center text-sm text-muted-foreground italic mt-8 max-w-xl mx-auto">
          {t("landing.pricing.freeNote")}
        </p>
      </div>
    </section>
  );
}
