"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/stores/transaction-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTranslation } from "@/hooks/use-translation";
import { getDateLocale } from "@/lib/i18n";

export function TransactionFilters() {
  const { filters, setFilters, resetFilters } = useTransactionStore();
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const categories = useCategoryStore((s) => s.categories);
  const { t, locale } = useTranslation();

  const [searchValue, setSearchValue] = useState(filters.search || "");

  const activeCount = useMemo(
    () =>
      [
        filters.type !== "ALL",
        filters.walletId,
        filters.categoryId,
        filters.dateFrom,
        filters.dateTo,
        filters.search,
      ].filter(Boolean).length,
    [filters],
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

  return (
    <div className="space-y-4">
      {/* Type Tabs */}
      <Tabs
        value={filters.type || "ALL"}
        onValueChange={(val) =>
          setFilters({ type: val as "ALL" | "INCOME" | "EXPENSE" | "TRANSFER" })
        }
      >
        <TabsList>
          <TabsTrigger value="ALL">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="INCOME">{t("common.income")}</TabsTrigger>
          <TabsTrigger value="EXPENSE">{t("common.expense")}</TabsTrigger>
          <TabsTrigger value="TRANSFER">{t("common.transfer")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Wallet Filter */}
        <Select
          value={filters.walletId || "ALL"}
          onValueChange={(val) => setFilters({ walletId: val === "ALL" ? undefined : val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("transaction.allWallets")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("transaction.allWallets")}</SelectItem>
            {wallets.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.categoryId || "ALL"}
          onValueChange={(val) => setFilters({ categoryId: val === "ALL" ? undefined : val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("transaction.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("transaction.allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom
                ? format(filters.dateFrom, "dd/MM/yy", { locale: getDateLocale(locale) })
                : t("common.from")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => setFilters({ dateFrom: date || undefined })}
              locale={getDateLocale(locale)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo
                ? format(filters.dateTo, "dd/MM/yy", { locale: getDateLocale(locale) })
                : t("common.to")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => setFilters({ dateTo: date || undefined })}
              locale={getDateLocale(locale)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("transaction.searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Reset */}
        <Button
          variant="ghost"
          size={activeCount > 0 ? "sm" : "icon"}
          onClick={() => {
            resetFilters();
            setSearchValue("");
          }}
          className={activeCount > 0 ? "gap-1.5" : ""}
        >
          <X className="h-4 w-4" />
          {activeCount > 0 && (
            <>
              <span className="text-sm">{t("common.reset")}</span>
              <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                {activeCount}
              </Badge>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
