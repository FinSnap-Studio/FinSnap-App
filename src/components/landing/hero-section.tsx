"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Coffee, ShoppingCart, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import { seedDemoData } from "@/lib/storage";

const MOCK_TXS = [
  { icon: Coffee, label: "Coffee", amount: "-Rp 35.000", color: "text-destructive" },
  { icon: ShoppingCart, label: "Groceries", amount: "-Rp 250.000", color: "text-destructive" },
  { icon: ArrowDownLeft, label: "Salary", amount: "+Rp 8.500.000", color: "text-primary" },
];

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-500">
      <div className="rounded-2xl border bg-card/80 backdrop-blur shadow-xl p-5 space-y-4">
        {/* Wallet balance bar */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="text-sm font-semibold">Rp 5.250.000</p>
          </div>
          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>

        <div className="border-t" />

        {/* Recent transactions */}
        <div className="space-y-2.5">
          {MOCK_TXS.map((tx) => (
            <div key={tx.label} className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <tx.icon className="size-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm flex-1">{tx.label}</span>
              <span className={`text-sm font-medium ${tx.color}`}>{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
              <Button
                size="lg"
                onClick={handleTryDemo}
                disabled={demoLoading}
                className="ring-primary/20 shadow-lg shadow-primary/25"
              >
                {demoLoading ? t("common.loading") : t("landing.hero.tryDemo")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
                {t("landing.hero.signIn")}
              </Button>
            </>
          )}
        </div>

        {/* Subtext */}
        {!isAuthenticated && (
          <p className="mt-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-500">
            {t("landing.hero.tryDemoSubtext")}
          </p>
        )}

        {/* Dashboard preview */}
        <HeroPreview />
      </div>
    </section>
  );
}
