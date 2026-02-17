import { type CurrencyCode, getCurrencyInfo } from "@/lib/currencies";

interface LocaleSeparators {
  thousand: string;
  decimal: string;
}

const separatorsCache = new Map<string, LocaleSeparators>();

export function getLocaleSeparators(locale: string): LocaleSeparators {
  let cached = separatorsCache.get(locale);
  if (cached) return cached;

  const parts = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
  }).formatToParts(1234.5);
  let thousand = "";
  let decimal = ".";
  for (const part of parts) {
    if (part.type === "group") thousand = part.value;
    if (part.type === "decimal") decimal = part.value;
  }
  cached = { thousand, decimal };
  separatorsCache.set(locale, cached);
  return cached;
}

const inputFormatters = new Map<string, Intl.NumberFormat>();

export function formatNumberForInput(
  value: number,
  currencyCode: CurrencyCode
): string {
  if (value === 0) return "";
  let formatter = inputFormatters.get(currencyCode);
  if (!formatter) {
    const info = getCurrencyInfo(currencyCode);
    formatter = new Intl.NumberFormat(info.locale, {
      numberingSystem: "latn",
      minimumFractionDigits: 0,
      maximumFractionDigits: info.maxFractionDigits,
      useGrouping: true,
    });
    inputFormatters.set(currencyCode, formatter);
  }
  return formatter.format(value);
}

export function parseFormattedNumber(
  text: string,
  locale: string
): number {
  const { thousand, decimal } = getLocaleSeparators(locale);
  let cleaned = text;
  if (thousand) {
    cleaned = cleaned.split(thousand).join("");
  }
  if (decimal !== ".") {
    cleaned = cleaned.replace(decimal, ".");
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
