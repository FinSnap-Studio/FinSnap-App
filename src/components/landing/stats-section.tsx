"use client";

import { Layers, Palette, Globe, Gift, Smartphone, Lock, type LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

const STATS = [
  { icon: Layers, valueKey: "landing.stats.features", descKey: "landing.stats.featuresDesc" },
  { icon: Palette, valueKey: "landing.stats.themes", descKey: "landing.stats.themesDesc" },
  { icon: Globe, valueKey: "landing.stats.languages", descKey: "landing.stats.languagesDesc" },
  { icon: Gift, valueKey: "landing.stats.free", descKey: "landing.stats.freeDesc" },
  { icon: Smartphone, valueKey: "landing.stats.pwa", descKey: "landing.stats.pwaDesc" },
  { icon: Lock, valueKey: "landing.stats.private", descKey: "landing.stats.privateDesc" },
] as const;

function StatCard({
  icon: Icon,
  valueKey,
  descKey,
  index,
}: {
  icon: LucideIcon;
  valueKey: string;
  descKey: string;
  index: number;
}) {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="landing-animate animate-fade-up text-center"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="size-6 text-primary" />
      </div>
      <p className="text-xl font-bold mb-1">{t(valueKey as TranslationKey)}</p>
      <p className="text-sm text-muted-foreground">{t(descKey as TranslationKey)}</p>
    </div>
  );
}

export function StatsSection() {
  const { t } = useTranslation();
  const headerRef = useScrollAnimation();

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-14 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.stats.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("landing.stats.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {STATS.map((stat, i) => (
            <StatCard key={stat.valueKey} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
