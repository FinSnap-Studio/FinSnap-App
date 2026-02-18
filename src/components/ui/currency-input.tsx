"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { type CurrencyCode, getCurrencyInfo } from "@/lib/currencies";
import {
  formatNumberForInput,
  getLocaleSeparators,
  parseFormattedNumber,
} from "@/lib/currency-format";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  currencyCode: CurrencyCode;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

function countDigits(str: string, upTo: number): number {
  let count = 0;
  for (let i = 0; i < upTo && i < str.length; i++) {
    if (/\d/.test(str[i])) count++;
  }
  return count;
}

function findPositionByDigitCount(str: string, digitCount: number): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (/\d/.test(str[i])) {
      count++;
      if (count === digitCount) return i + 1;
    }
  }
  return str.length;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChange,
      onBlur,
      currencyCode,
      placeholder = "0",
      disabled = false,
      hasError = false,
      className,
    },
    ref,
  ) {
    const info = getCurrencyInfo(currencyCode);
    const separators = getLocaleSeparators(info.locale);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!, []);
    const [displayValue, setDisplayValue] = useState(() =>
      formatNumberForInput(value, currencyCode),
    );

    // Sync display when value or currency changes externally (form.reset, currency switch)
    useEffect(() => {
      setDisplayValue(formatNumberForInput(value, currencyCode));
    }, [value, currencyCode]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const raw = input.value;
      const cursorPos = input.selectionStart ?? raw.length;

      // Count digits before cursor in old (raw) value
      const digitsBefore = countDigits(raw, cursorPos);

      // Build cleaned string: only digits + decimal separator (max one)
      const decimalSep = separators.decimal;
      let hasDecimal = false;
      let cleaned = "";

      for (const ch of raw) {
        if (/\d/.test(ch)) {
          cleaned += ch;
        } else if (ch === decimalSep && !hasDecimal && info.maxFractionDigits > 0) {
          cleaned += ch;
          hasDecimal = true;
        }
      }

      // Limit decimal digits
      if (hasDecimal) {
        const parts = cleaned.split(decimalSep);
        if (parts[1] && parts[1].length > info.maxFractionDigits) {
          parts[1] = parts[1].slice(0, info.maxFractionDigits);
        }
        cleaned = parts[0] + decimalSep + (parts[1] ?? "");
      }

      // Parse numeric value
      const numericValue = parseFormattedNumber(cleaned, info.locale);

      // Format for display (keep trailing decimal separator)
      let formatted: string;
      const endsWithDecimal = cleaned.endsWith(decimalSep);
      const trailingZeros = hasDecimal ? (cleaned.split(decimalSep)[1] ?? "") : "";

      if (cleaned === "" || cleaned === decimalSep) {
        formatted = "";
      } else {
        formatted = formatNumberForInput(numericValue, currencyCode);
        // Preserve trailing decimal sep and zeros during typing
        if (endsWithDecimal && !formatted.includes(decimalSep)) {
          formatted += decimalSep;
        } else if (hasDecimal && trailingZeros.endsWith("0")) {
          const fmtParts = formatted.split(decimalSep);
          const fmtDecimals = fmtParts[1] ?? "";
          if (trailingZeros.length > fmtDecimals.length) {
            formatted = fmtParts[0] + decimalSep + trailingZeros.slice(0, info.maxFractionDigits);
          }
        }
      }

      setDisplayValue(formatted);
      onChange(numericValue);

      // Restore cursor position based on digit count
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const newPos = findPositionByDigitCount(formatted, digitsBefore);
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      });
    };

    const handleBlur = () => {
      // Clean format on blur (remove trailing decimal)
      setDisplayValue(formatNumberForInput(value, currencyCode));
      onBlur?.();
    };

    const handle000Press = (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault(); // prevent input from losing focus
      if (value > 0) {
        onChange(value * 1000);
      }
    };

    // Dynamic padding based on symbol length
    const symbolLen = info.symbol.length;
    const paddingClass = symbolLen <= 1 ? "pl-7" : symbolLen <= 2 ? "pl-10" : "pl-13";

    return (
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
          aria-hidden
        >
          {info.symbol}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            paddingClass,
            "pr-14 md:pr-3",
            className,
          )}
        />
        <button
          type="button"
          onPointerDown={handle000Press}
          disabled={disabled || value === 0}
          className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden h-6 px-2 rounded text-xs font-mono font-medium bg-muted hover:bg-muted/80 text-muted-foreground border disabled:opacity-40"
        >
          000
        </button>
      </div>
    );
  },
);
