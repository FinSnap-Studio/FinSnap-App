import { create } from "zustand";
import { type ColorThemeId, DEFAULT_COLOR_THEME, VALID_COLOR_THEME_IDS } from "@/lib/themes";
import { type CurrencyCode, CURRENCY_CODES, DEFAULT_CURRENCY } from "@/lib/currencies";
import { type Locale, type TFunction, LOCALES, DEFAULT_LOCALE, createT } from "@/lib/i18n";

type Theme = "light" | "dark";

interface UIStore {
  sidebarOpen: boolean;
  theme: Theme;
  colorTheme: ColorThemeId;
  defaultCurrency: CurrencyCode;
  locale: Locale;
  t: TFunction;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setColorTheme: (ct: ColorThemeId) => void;
  setDefaultCurrency: (code: CurrencyCode) => void;
  setLocale: (locale: Locale) => void;
  initTheme: () => void;
}

function applyColorTheme(ct: ColorThemeId) {
  if (ct === DEFAULT_COLOR_THEME) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", ct);
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  theme: "light",
  colorTheme: DEFAULT_COLOR_THEME,
  defaultCurrency: DEFAULT_CURRENCY,
  locale: DEFAULT_LOCALE,
  t: createT(DEFAULT_LOCALE),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("finsnap-theme", next);
    set({ theme: next });
  },
  setColorTheme: (ct) => {
    applyColorTheme(ct);
    localStorage.setItem("finsnap-color-theme", ct);
    set({ colorTheme: ct });
  },
  setDefaultCurrency: (code) => {
    localStorage.setItem("finsnap-default-currency", code);
    set({ defaultCurrency: code });
  },
  setLocale: (locale) => {
    localStorage.setItem("finsnap-locale", locale);
    document.documentElement.lang = locale;
    set({ locale, t: createT(locale) });
  },
  initTheme: () => {
    const saved = localStorage.getItem("finsnap-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");

    const savedColor = localStorage.getItem("finsnap-color-theme");
    const colorTheme: ColorThemeId =
      savedColor && VALID_COLOR_THEME_IDS.has(savedColor)
        ? (savedColor as ColorThemeId)
        : DEFAULT_COLOR_THEME;
    applyColorTheme(colorTheme);

    const savedCurrency = localStorage.getItem("finsnap-default-currency");
    const defaultCurrency: CurrencyCode =
      savedCurrency && (CURRENCY_CODES as readonly string[]).includes(savedCurrency)
        ? (savedCurrency as CurrencyCode)
        : DEFAULT_CURRENCY;

    const savedLocale = localStorage.getItem("finsnap-locale");
    const locale: Locale =
      savedLocale && (LOCALES as string[]).includes(savedLocale)
        ? (savedLocale as Locale)
        : DEFAULT_LOCALE;
    document.documentElement.lang = locale;

    set({ theme, colorTheme, defaultCurrency, locale, t: createT(locale) });
  },
}));
