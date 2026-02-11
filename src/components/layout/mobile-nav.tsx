"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Tag,
};

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-card border-t md:hidden">
      <div className="flex items-center justify-around h-full">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-[10px]">{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
