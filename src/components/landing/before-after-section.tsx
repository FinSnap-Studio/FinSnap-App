"use client";

import {
  AlertTriangle,
  X,
  Check,
  ArrowRight,
  Coffee,
  ShoppingCart,
  Banknote,
  Zap,
  Wifi,
  Tv,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";
import { type TranslationKey } from "@/lib/i18n";

// ─── Mock visual components (module-level) ───────────────────────────

function MockDashboardMini() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
      {/* Wallet balance bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Total Balance</span>
        </div>
        <span className="text-sm font-bold text-primary">Rp 8.450.000</span>
      </div>
      <div className="h-px bg-border" />
      {/* Transaction rows */}
      {[
        { icon: Coffee, label: "Coffee", amount: "-Rp 35.000", color: "text-destructive" },
        {
          icon: ShoppingCart,
          label: "Groceries",
          amount: "-Rp 245.000",
          color: "text-destructive",
        },
        { icon: Banknote, label: "Salary", amount: "+Rp 8.500.000", color: "text-primary" },
      ].map((tx) => (
        <div key={tx.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-muted flex items-center justify-center">
              <tx.icon className="size-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{tx.label}</span>
          </div>
          <span className={`text-xs font-medium ${tx.color}`}>{tx.amount}</span>
        </div>
      ))}
    </div>
  );
}

function MockBudgetAlert() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3.5">
      {[
        { label: "Food", pct: 62, budget: "620K / 1M", over: false },
        { label: "Transport", pct: 95, budget: "475K / 500K", over: true },
        { label: "Entertainment", pct: 40, budget: "200K / 500K", over: false },
      ].map((b) => (
        <div key={b.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${b.over ? "text-destructive" : "text-foreground"}`}>
              {b.label}
            </span>
            <span className="text-muted-foreground">Rp {b.budget}</span>
          </div>
          <Progress
            value={b.pct}
            className={`h-2 ${b.over ? "[&>div]:bg-destructive bg-destructive/20" : ""}`}
          />
          {b.over && (
            <p className="text-[10px] text-destructive font-medium flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Near limit!
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function MockRecurringList() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      {[
        { icon: Zap, label: "Electricity", date: "Every 1st", done: true },
        { icon: Wifi, label: "Internet", date: "Every 5th", done: true },
        { icon: Tv, label: "Streaming", date: "Every 15th", done: false },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-muted flex items-center justify-center">
              <item.icon className="size-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.date}</p>
            </div>
          </div>
          <CheckCircle2
            className={`size-4 ${item.done ? "text-primary" : "text-muted-foreground/30"}`}
          />
        </div>
      ))}
    </div>
  );
}

function MockWalletTransfer() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 justify-center">
        {/* From wallet */}
        <div className="flex-1 rounded-lg border bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Cash</p>
          <p className="text-sm font-bold">Rp 5.250.000</p>
        </div>
        {/* Arrow */}
        <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <ArrowRight className="size-4 text-primary" />
        </div>
        {/* To wallet */}
        <div className="flex-1 rounded-lg border bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">GoPay</p>
          <p className="text-sm font-bold">Rp 2.100.000</p>
        </div>
      </div>
    </div>
  );
}

// ─── Row data ────────────────────────────────────────────────────────

const ROWS = [
  {
    variant: "standard" as const,
    beforeKey: "landing.beforeAfter.before1",
    afterKey: "landing.beforeAfter.after1",
    afterDescKey: "landing.beforeAfter.afterDesc1",
    Visual: MockDashboardMini,
    animLeft: "animate-slide-left",
    animRight: "animate-slide-right",
  },
  {
    variant: "reversed" as const,
    beforeKey: "landing.beforeAfter.before2",
    afterKey: "landing.beforeAfter.after2",
    afterDescKey: "landing.beforeAfter.afterDesc2",
    Visual: MockBudgetAlert,
    animLeft: "animate-slide-right",
    animRight: "animate-slide-left",
  },
  {
    variant: "centered" as const,
    beforeKey: "landing.beforeAfter.before3",
    afterKey: "landing.beforeAfter.after3",
    afterDescKey: "landing.beforeAfter.afterDesc3",
    Visual: MockRecurringList,
    animLeft: "animate-fade-up",
    animRight: "animate-fade-up",
  },
  {
    variant: "standard" as const,
    beforeKey: "landing.beforeAfter.before4",
    afterKey: "landing.beforeAfter.after4",
    afterDescKey: "landing.beforeAfter.afterDesc4",
    Visual: MockWalletTransfer,
    animLeft: "animate-slide-left",
    animRight: "animate-slide-right",
  },
];

// ─── Row renderers ───────────────────────────────────────────────────

function TextBlock({
  beforeKey,
  afterKey,
  afterDescKey,
}: {
  beforeKey: string;
  afterKey: string;
  afterDescKey: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-md bg-destructive/10 flex items-center justify-center">
          <X className="size-3.5 text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium line-through decoration-destructive/40">
          {t(beforeKey as TranslationKey)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Check className="size-3.5 text-primary" />
        </div>
        <p className="text-sm text-primary font-semibold">{t(afterKey as TranslationKey)}</p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-8">
        {t(afterDescKey as TranslationKey)}
      </p>
    </div>
  );
}

function StandardRow({ row, reversed }: { row: (typeof ROWS)[0]; reversed?: boolean }) {
  const leftRef = useScrollAnimation();
  const rightRef = useScrollAnimation();

  return (
    <div
      className={`flex flex-col gap-6 items-center ${reversed ? "md:flex-row-reverse" : "md:flex-row"}`}
    >
      {/* Text side */}
      <div ref={leftRef} className={`flex-1 w-full landing-animate ${row.animLeft}`}>
        <TextBlock
          beforeKey={row.beforeKey}
          afterKey={row.afterKey}
          afterDescKey={row.afterDescKey}
        />
      </div>
      {/* Visual side */}
      <div ref={rightRef} className={`flex-1 w-full landing-animate ${row.animRight}`}>
        <row.Visual />
      </div>
    </div>
  );
}

function CenteredRow({ row }: { row: (typeof ROWS)[2] }) {
  const ref = useScrollAnimation();

  return (
    <div ref={ref} className={`landing-animate ${row.animLeft}`}>
      <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text side */}
          <div className="flex items-center">
            <TextBlock
              beforeKey={row.beforeKey}
              afterKey={row.afterKey}
              afterDescKey={row.afterDescKey}
            />
          </div>
          {/* Divider (desktop only) + Visual */}
          <div className="md:border-l md:pl-6">
            <row.Visual />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────

export function BeforeAfterSection() {
  const { t } = useTranslation();
  const headerRef = useScrollAnimation();

  return (
    <section id="before-after" className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="text-center mb-14 landing-animate animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.beforeAfter.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.beforeAfter.subtitle")}
          </p>
        </div>

        <div className="space-y-10 sm:space-y-14">
          {ROWS.map((row) => {
            if (row.variant === "centered") {
              return <CenteredRow key={row.beforeKey} row={row} />;
            }
            return (
              <StandardRow key={row.beforeKey} row={row} reversed={row.variant === "reversed"} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
