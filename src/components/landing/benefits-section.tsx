"use client";

import { ShoppingCart, Coffee, Zap, Car, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

function MockTransactions() {
  const items = [
    { icon: Coffee, label: "Coffee", amount: "-Rp 35.000", color: "text-destructive" },
    { icon: ShoppingCart, label: "Groceries", amount: "-Rp 250.000", color: "text-destructive" },
    { icon: ArrowDownLeft, label: "Salary", amount: "+Rp 8.500.000", color: "text-primary" },
    { icon: Zap, label: "Electricity", amount: "-Rp 450.000", color: "text-destructive" },
    { icon: Car, label: "Transport", amount: "-Rp 75.000", color: "text-destructive" },
  ];

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <item.icon className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm flex-1">{item.label}</span>
          <span className={`text-sm font-medium ${item.color}`}>{item.amount}</span>
        </div>
      ))}
    </div>
  );
}

function MockBudgets() {
  const budgets = [
    { label: "Food & Drinks", spent: 750000, limit: 1000000, pct: 75 },
    { label: "Transport", spent: 280000, limit: 500000, pct: 56 },
    { label: "Entertainment", spent: 450000, limit: 300000, pct: 150 },
  ];

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
      {budgets.map((b) => (
        <div key={b.label} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>{b.label}</span>
            <span
              className={`font-medium ${b.pct > 100 ? "text-destructive" : b.pct > 75 ? "text-amber-500" : "text-primary"}`}
            >
              {b.pct}%
            </span>
          </div>
          <Progress value={Math.min(b.pct, 100)} />
          <p className="text-xs text-muted-foreground">
            Rp {b.spent.toLocaleString()} / Rp {b.limit.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function MockChart() {
  const bars = [
    { label: "Sep", h: 45 },
    { label: "Oct", h: 65 },
    { label: "Nov", h: 55 },
    { label: "Dec", h: 80 },
    { label: "Jan", h: 70 },
    { label: "Feb", h: 40 },
  ];

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">
      <div className="flex items-end justify-between gap-2 h-32 mb-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${bar.h}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2">
        {bars.map((bar) => (
          <span key={bar.label} className="flex-1 text-center text-xs text-muted-foreground">
            {bar.label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t">
        <div className="flex items-center gap-1.5">
          <ArrowDownLeft className="size-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3.5 text-destructive" />
          <span className="text-xs text-muted-foreground">Expense</span>
        </div>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    titleKey: "landing.benefits.trackTitle",
    descKey: "landing.benefits.trackDesc",
    Visual: MockTransactions,
    animLeft: "animate-slide-left",
    animRight: "animate-slide-right",
  },
  {
    titleKey: "landing.benefits.budgetTitle",
    descKey: "landing.benefits.budgetDesc",
    Visual: MockBudgets,
    animLeft: "animate-slide-right",
    animRight: "animate-slide-left",
  },
  {
    titleKey: "landing.benefits.insightTitle",
    descKey: "landing.benefits.insightDesc",
    Visual: MockChart,
    animLeft: "animate-slide-left",
    animRight: "animate-slide-right",
  },
] as const;

export function BenefitsSection() {
  const { t } = useTranslation();
  const headerRef = useScrollAnimation();

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-14 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.benefits.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.benefits.subtitle")}
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {BENEFITS.map((benefit, i) => (
            <BenefitRow key={benefit.titleKey} {...benefit} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitRow({
  titleKey,
  descKey,
  Visual,
  animLeft,
  animRight,
  index,
}: (typeof BENEFITS)[number] & { index: number }) {
  const { t } = useTranslation();
  const textRef = useScrollAnimation();
  const visualRef = useScrollAnimation();
  const reversed = index % 2 === 1;

  return (
    <div
      className={`flex flex-col gap-8 md:gap-12 ${
        reversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-center`}
    >
      <div ref={textRef} className={`flex-1 landing-animate ${animLeft}`}>
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">{t(titleKey as TranslationKey)}</h3>
        <p className="text-muted-foreground leading-relaxed">{t(descKey as TranslationKey)}</p>
      </div>
      <div
        ref={visualRef}
        className={`flex-1 w-full max-w-sm md:max-w-none landing-animate ${animRight}`}
      >
        <Visual />
      </div>
    </div>
  );
}
