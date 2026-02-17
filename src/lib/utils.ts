import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { type CurrencyCode, getCurrencyInfo } from "@/lib/currencies";
import { type Locale, getDateLocale } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency?: CurrencyCode): string {
  const code = currency ?? "IDR";
  let formatter = currencyFormatters.get(code);
  if (!formatter) {
    const info = getCurrencyInfo(code);
    formatter = new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: info.minFractionDigits,
      maximumFractionDigits: info.maxFractionDigits,
    });
    currencyFormatters.set(code, formatter);
  }
  return formatter.format(amount);
}

export function formatDate(dateString: string, pattern = "dd MMM yyyy", locale?: Locale): string {
  return format(parseISO(dateString), pattern, { locale: getDateLocale(locale ?? "id") });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getMonthName(month: number, locale?: Locale): string {
  return format(new Date(2024, month - 1, 1), "MMMM", { locale: getDateLocale(locale ?? "id") });
}

export function getBudgetStatus(spent: number, amount: number): "safe" | "warning" | "danger" {
  if (amount <= 0) return "safe";
  const pct = (spent / amount) * 100;
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "safe";
}

export function getBudgetStatusColor(status: "safe" | "warning" | "danger"): string {
  const map = { safe: "text-green-600", warning: "text-yellow-600", danger: "text-red-600" };
  return map[status];
}

export function getTransactionColor(type: "INCOME" | "EXPENSE" | "TRANSFER"): string {
  const map = { INCOME: "text-green-600", EXPENSE: "text-red-600", TRANSFER: "text-blue-600" };
  return map[type];
}

export function getTransactionSign(type: "INCOME" | "EXPENSE" | "TRANSFER"): string {
  const map = { INCOME: "+", EXPENSE: "-", TRANSFER: "↔" };
  return map[type];
}

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}
