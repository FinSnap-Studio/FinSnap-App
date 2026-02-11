"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Menu, Sun, Moon, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { seedDemoData } from "@/lib/storage";
import { useTranslation } from "@/hooks/use-translation";
import { COLOR_THEMES } from "@/lib/themes";
import { LOCALE_OPTIONS } from "@/lib/i18n";

const NAV_LINKS = [
  { key: "landing.nav.features" as const, href: "#features" },
  { key: "landing.nav.benefits" as const, href: "#benefits" },
  { key: "landing.nav.pricing" as const, href: "#pricing" },
  { key: "landing.nav.developer" as const, href: "#developer" },
];

export function LandingNavbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, colorTheme, setColorTheme, locale, setLocale } =
    useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  }, []);

  const handleTryDemo = useCallback(async () => {
    setDemoLoading(true);
    seedDemoData();
    await useAuthStore.getState().login("demo@finsnap.app", "demo");
    router.push("/dashboard");
  }, [router]);

  const currentFlag =
    LOCALE_OPTIONS.find((o) => o.code === locale)?.flag ?? "🌐";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Wallet className="size-6 text-primary" />
          <span>FinSnap</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              {t(link.key)}
            </button>
          ))}
        </div>

        {/* Preferences + CTA */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>

          {/* Color theme dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Palette className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuLabel className="text-xs">
                {t("settings.colorTheme")}
              </DropdownMenuLabel>
              <div className="flex gap-1.5 px-2 pb-2">
                {COLOR_THEMES.map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    className="relative size-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ background: ct.previewColors.primary }}
                    onClick={() => setColorTheme(ct.id)}
                  >
                    {colorTheme === ct.id && (
                      <Check className="absolute inset-0 m-auto size-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
          >
            <span className="text-sm leading-none">{currentFlag}</span>
          </Button>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <div className="w-px h-5 bg-border mx-1" />
            {isAuthenticated ? (
              <Button onClick={() => router.push("/dashboard")}>
                {t("landing.nav.goToDashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                >
                  {t("landing.nav.signIn")}
                </Button>
                <Button onClick={handleTryDemo} disabled={demoLoading}>
                  {demoLoading ? t("common.loading") : t("landing.nav.tryDemo")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <SheetTitle className="flex items-center gap-2 font-bold text-lg">
              <Wallet className="size-5 text-primary" />
              FinSnap
            </SheetTitle>
            <div className="flex flex-col gap-1 mt-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="px-3 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {t(link.key)}
                </button>
              ))}
            </div>

            {/* Mobile Auth CTA */}
            <div className="flex flex-col gap-2 mt-6 pt-6 border-t">
              {isAuthenticated ? (
                <Button onClick={() => { setOpen(false); router.push("/dashboard"); }}>
                  {t("landing.nav.goToDashboard")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => { setOpen(false); router.push("/login"); }}
                  >
                    {t("landing.nav.signIn")}
                  </Button>
                  <Button onClick={handleTryDemo} disabled={demoLoading}>
                    {demoLoading ? t("common.loading") : t("landing.nav.tryDemo")}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </nav>
    </header>
  );
}
