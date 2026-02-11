import { id as idDict, type TranslationKey } from "./id";
import { en as enDict } from "./en";
import { id as idLocale, enUS } from "date-fns/locale";

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";

export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  id: idDict,
  en: enDict,
};

export function createT(locale: Locale): TFunction {
  const dict = dictionaries[locale];
  return (key, vars) => {
    let str = dict[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  };
}

export function getDateLocale(locale: Locale) {
  return locale === "id" ? idLocale : enUS;
}

export const LOCALE_OPTIONS = [
  { code: "id" as Locale, label: "Bahasa Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "en" as Locale, label: "English", flag: "\u{1F1EC}\u{1F1E7}" },
];

export type { TranslationKey };
