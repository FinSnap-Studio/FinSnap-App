"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { DeveloperSection } from "@/components/landing/developer-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  const { isLoading, checkAuth } = useAuthStore();
  const initTheme = useUIStore((s) => s.initTheme);

  useEffect(() => {
    checkAuth();
    initTheme();
  }, [checkAuth, initTheme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main className="pt-16">
        <HeroSection />
        <BeforeAfterSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <FinalCtaSection />
        <DeveloperSection />
      </main>
      <LandingFooter />
    </div>
  );
}
