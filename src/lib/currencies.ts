export const CURRENCY_CODES = [
  "IDR",
  "USD",
  "EUR",
  "SGD",
  "MYR",
  "JPY",
  "GBP",
  "AUD",
  "CNY",
  "THB",
  "KRW",
  "SAR",
  "HKD",
  "TWD",
  "INR",
  "NZD",
  "CAD",
  "CHF",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "IDR";

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
  minFractionDigits: number;
  maxFractionDigits: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: "IDR",
    name: "Rupiah Indonesia",
    symbol: "Rp",
    locale: "id-ID",
    flag: "\u{1F1EE}\u{1F1E9}",
    minFractionDigits: 0,
    maxFractionDigits: 0,
  },
  {
    code: "USD",
    name: "Dolar Amerika",
    symbol: "$",
    locale: "en-US",
    flag: "\u{1F1FA}\u{1F1F8}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "\u20AC",
    locale: "de-DE",
    flag: "\u{1F1EA}\u{1F1FA}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "SGD",
    name: "Dolar Singapura",
    symbol: "S$",
    locale: "en-SG",
    flag: "\u{1F1F8}\u{1F1EC}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "MYR",
    name: "Ringgit Malaysia",
    symbol: "RM",
    locale: "ms-MY",
    flag: "\u{1F1F2}\u{1F1FE}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "JPY",
    name: "Yen Jepang",
    symbol: "\u00A5",
    locale: "ja-JP",
    flag: "\u{1F1EF}\u{1F1F5}",
    minFractionDigits: 0,
    maxFractionDigits: 0,
  },
  {
    code: "GBP",
    name: "Pound Inggris",
    symbol: "\u00A3",
    locale: "en-GB",
    flag: "\u{1F1EC}\u{1F1E7}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "AUD",
    name: "Dolar Australia",
    symbol: "A$",
    locale: "en-AU",
    flag: "\u{1F1E6}\u{1F1FA}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "CNY",
    name: "Yuan Tiongkok",
    symbol: "\u00A5",
    locale: "zh-CN",
    flag: "\u{1F1E8}\u{1F1F3}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "THB",
    name: "Baht Thailand",
    symbol: "\u0E3F",
    locale: "th-TH",
    flag: "\u{1F1F9}\u{1F1ED}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "KRW",
    name: "Won Korea",
    symbol: "\u20A9",
    locale: "ko-KR",
    flag: "\u{1F1F0}\u{1F1F7}",
    minFractionDigits: 0,
    maxFractionDigits: 0,
  },
  {
    code: "SAR",
    name: "Riyal Saudi",
    symbol: "SAR",
    locale: "ar-SA",
    flag: "\u{1F1F8}\u{1F1E6}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "HKD",
    name: "Dolar Hong Kong",
    symbol: "HK$",
    locale: "zh-HK",
    flag: "\u{1F1ED}\u{1F1F0}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "TWD",
    name: "Dolar Taiwan",
    symbol: "NT$",
    locale: "zh-TW",
    flag: "\u{1F1F9}\u{1F1FC}",
    minFractionDigits: 0,
    maxFractionDigits: 0,
  },
  {
    code: "INR",
    name: "Rupee India",
    symbol: "\u20B9",
    locale: "en-IN",
    flag: "\u{1F1EE}\u{1F1F3}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "NZD",
    name: "Dolar Selandia Baru",
    symbol: "NZ$",
    locale: "en-NZ",
    flag: "\u{1F1F3}\u{1F1FF}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "CAD",
    name: "Dolar Kanada",
    symbol: "C$",
    locale: "en-CA",
    flag: "\u{1F1E8}\u{1F1E6}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
  {
    code: "CHF",
    name: "Franc Swiss",
    symbol: "CHF",
    locale: "de-CH",
    flag: "\u{1F1E8}\u{1F1ED}",
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
];

export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}
