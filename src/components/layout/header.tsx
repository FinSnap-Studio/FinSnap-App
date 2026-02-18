"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Wallet, Settings, LogOut, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import { COLOR_THEMES } from "@/lib/themes";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const { theme, toggleTheme, colorTheme, setColorTheme, setLocale, locale, initTheme } =
    useUIStore();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label;

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <div className="md:hidden flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">{pageTitle ? t(pageTitle) : "FinSnap"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-none">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">{t("settings.colorTheme")}</DropdownMenuLabel>
              <div className="flex gap-1.5 px-2 pb-2">
                {COLOR_THEMES.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    type="button"
                    className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ background: themeOption.previewColors.primary }}
                    onClick={() => setColorTheme(themeOption.id)}
                  >
                    {colorTheme === themeOption.id && (
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">{t("settings.language")}</DropdownMenuLabel>
              <div className="flex gap-1.5 px-2 pb-2">
                {LOCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${locale === opt.code ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    onClick={() => setLocale(opt.code)}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              {t("sidebar.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("sidebar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
