import type { TranslationKey } from "@/lib/i18n";

export const COLOR_THEME_IDS = [
  "slate",
  "emerald",
  "violet",
  "rose",
  "ocean",
  "amber",
  "sunset",
] as const;

export type ColorThemeId = (typeof COLOR_THEME_IDS)[number];

export const DEFAULT_COLOR_THEME: ColorThemeId = "slate";

export const VALID_COLOR_THEME_IDS: ReadonlySet<string> = new Set(COLOR_THEME_IDS);

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  descriptionKey: TranslationKey;
  previewColors: { primary: string; secondary: string };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "slate",
    name: "Slate",
    descriptionKey: "theme.slate.desc",
    previewColors: { primary: "oklch(0.398 0.07 227)", secondary: "oklch(0.6 0.118 185)" },
  },
  {
    id: "emerald",
    name: "Emerald",
    descriptionKey: "theme.emerald.desc",
    previewColors: { primary: "oklch(0.45 0.15 155)", secondary: "oklch(0.6 0.12 170)" },
  },
  {
    id: "violet",
    name: "Violet",
    descriptionKey: "theme.violet.desc",
    previewColors: { primary: "oklch(0.45 0.18 285)", secondary: "oklch(0.6 0.15 300)" },
  },
  {
    id: "rose",
    name: "Rose",
    descriptionKey: "theme.rose.desc",
    previewColors: { primary: "oklch(0.5 0.15 350)", secondary: "oklch(0.65 0.12 10)" },
  },
  {
    id: "ocean",
    name: "Ocean",
    descriptionKey: "theme.ocean.desc",
    previewColors: { primary: "oklch(0.45 0.14 230)", secondary: "oklch(0.6 0.12 210)" },
  },
  {
    id: "amber",
    name: "Amber",
    descriptionKey: "theme.amber.desc",
    previewColors: { primary: "oklch(0.50 0.16 80)", secondary: "oklch(0.65 0.14 65)" },
  },
  {
    id: "sunset",
    name: "Sunset",
    descriptionKey: "theme.sunset.desc",
    previewColors: { primary: "oklch(0.55 0.18 25)", secondary: "oklch(0.65 0.16 40)" },
  },
];
