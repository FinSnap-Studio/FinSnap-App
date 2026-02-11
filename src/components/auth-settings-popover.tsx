"use client";

import { Settings, Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "@/hooks/use-translation";
import { COLOR_THEMES } from "@/lib/themes";
import { LOCALE_OPTIONS } from "@/lib/i18n";

export function AuthSettingsPopover() {
  const { theme, toggleTheme, colorTheme, setColorTheme, locale, setLocale } =
    useUIStore();
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        {/* Language */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("settings.language")}</p>
          <div className="flex gap-2">
            {LOCALE_OPTIONS.map((opt) => (
              <Button
                key={opt.code}
                variant={locale === opt.code ? "default" : "outline"}
                size="sm"
                className="flex-1 min-w-0 shrink"
                onClick={() => setLocale(opt.code)}
              >
                <span>{opt.flag}</span>
                <span className="truncate">{opt.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Light / Dark Mode */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("settings.mode")}</p>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => theme !== "light" && toggleTheme()}
            >
              <Sun className="h-4 w-4 mr-1.5" />
              {t("settings.light")}
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => theme !== "dark" && toggleTheme()}
            >
              <Moon className="h-4 w-4 mr-1.5" />
              {t("settings.dark")}
            </Button>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Color Theme */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("settings.colorTheme")}</p>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_THEMES.map((themeItem) => {
              const isActive = colorTheme === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  onClick={() => setColorTheme(themeItem.id)}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-colors hover:bg-accent/50 ${
                    isActive
                      ? "border-primary bg-accent/30"
                      : "border-border"
                  }`}
                >
                  <div className="flex gap-1">
                    <span
                      className="relative h-4 w-4 rounded-full border border-border/50"
                      style={{ background: themeItem.previewColors.primary }}
                    >
                      {isActive && (
                        <Check className="absolute inset-0 m-auto h-2.5 w-2.5 text-white" />
                      )}
                    </span>
                    <span
                      className="h-4 w-4 rounded-full border border-border/50"
                      style={{ background: themeItem.previewColors.secondary }}
                    />
                  </div>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {themeItem.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
