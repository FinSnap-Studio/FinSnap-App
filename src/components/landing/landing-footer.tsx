"use client";

import { Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold">
          <Wallet className="size-4 text-primary" />
          <span>FinSnap</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {t("landing.footer.copyright", { year: new Date().getFullYear().toString() })}
        </span>
      </div>
    </footer>
  );
}
