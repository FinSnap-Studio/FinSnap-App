"use client";

import { useState, useMemo } from "react";
import {
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Palette,
  ShoppingCart,
  Landmark,
  Repeat,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

const FEATURES = [
  {
    icon: Wallet,
    titleKey: "landing.features.multiWallet",
    descKey: "landing.features.multiWalletDesc",
    group: "core" as const,
  },
  {
    icon: ArrowLeftRight,
    titleKey: "landing.features.smartTracking",
    descKey: "landing.features.smartTrackingDesc",
    group: "core" as const,
  },
  {
    icon: PiggyBank,
    titleKey: "landing.features.budgetPlanner",
    descKey: "landing.features.budgetPlannerDesc",
    group: "core" as const,
  },
  {
    icon: BarChart3,
    titleKey: "landing.features.analytics",
    descKey: "landing.features.analyticsDesc",
    group: "core" as const,
  },
  {
    icon: Palette,
    titleKey: "landing.features.personalization",
    descKey: "landing.features.personalizationDesc",
    group: "core" as const,
  },
  {
    icon: Smartphone,
    titleKey: "landing.features.pwaReady",
    descKey: "landing.features.pwaReadyDesc",
    group: "core" as const,
  },
  {
    icon: ShoppingCart,
    titleKey: "landing.features.shoppingList",
    descKey: "landing.features.shoppingListDesc",
    group: "extra" as const,
  },
  {
    icon: Landmark,
    titleKey: "landing.features.debtTracking",
    descKey: "landing.features.debtTrackingDesc",
    group: "extra" as const,
  },
  {
    icon: Repeat,
    titleKey: "landing.features.recurringTx",
    descKey: "landing.features.recurringTxDesc",
    group: "extra" as const,
  },
];

function FeatureFilter({
  filter,
  onChange,
}: {
  filter: "core" | "all";
  onChange: (value: "core" | "all") => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-full border bg-muted/50 p-1 mb-10">
      <button
        type="button"
        onClick={() => onChange("core")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          filter === "core"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("landing.features.filterCore")}
      </button>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          filter === "all"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("landing.features.filterAll")}
      </button>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  titleKey,
  descKey,
  index,
}: {
  icon: LucideIcon;
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
  const [filter, setFilter] = useState<"core" | "all">("core");

  const visibleFeatures = useMemo(
    () => (filter === "core" ? FEATURES.filter((f) => f.group === "core") : [...FEATURES]),
    [filter],
  );

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-4 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.features.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </div>

        <div className="flex justify-center">
          <FeatureFilter filter={filter} onChange={setFilter} />
        </div>

        <div key={filter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFeatures.map((feature, i) => (
            <FeatureCard key={feature.titleKey} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
