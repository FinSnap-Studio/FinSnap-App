"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, type CurrencyCode } from "@/lib/currencies";

interface CurrencySelectProps {
  value: CurrencyCode;
  onValueChange: (value: CurrencyCode) => void;
  disabled?: boolean;
}

export function CurrencySelect({ value, onValueChange, disabled }: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as CurrencyCode)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Pilih mata uang" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.flag} {c.code} - {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
