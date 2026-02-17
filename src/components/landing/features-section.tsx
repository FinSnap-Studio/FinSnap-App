"use client";

import { Wallet, ArrowLeftRight, PiggyBank, BarChart3, Palette, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

const FEATURES = [
  {
    icon: Wallet,
    titleKey: "landing.features.multiWallet",
    descKey: "landing.features.multiWalletDesc",
  },
  {
    icon: ArrowLeftRight,
    titleKey: "landing.features.smartTracking",
    descKey: "landing.features.smartTrackingDesc",
  },
  {
    icon: PiggyBank,
    titleKey: "landing.features.budgetPlanner",
    descKey: "landing.features.budgetPlannerDesc",
  },
  {
    icon: BarChart3,
    titleKey: "landing.features.analytics",
    descKey: "landing.features.analyticsDesc",
  },
  {
    icon: Palette,
    titleKey: "landing.features.personalization",
    descKey: "landing.features.personalizationDesc",
  },
  {
    icon: ShieldCheck,
    titleKey: "landing.features.privacyFirst",
    descKey: "landing.features.privacyFirstDesc",
  },
] as const;

function FeatureCard({
  icon: Icon,
  titleKey,
  descKey,
  index,
}: {
  icon: typeof Wallet;
  titleKey: string;
  descKey: string;
  index: number;
}) {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="landing-animate animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="h-full border hover:border-primary/30 transition-colors">
        <CardContent className="pt-6">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="size-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t(titleKey as TranslationKey)}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(descKey as TranslationKey)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();
  const headerRef = useScrollAnimation();

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-14 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.features.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.titleKey} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
