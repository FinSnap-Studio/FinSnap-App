"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeftRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { formatCurrency, formatDate, getTransactionColor, getTransactionSign } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";
import { useRecentTransactions } from "@/hooks/use-transaction-computed";
import { type TransactionType } from "@/types";

function TypeBadge({ type, t }: { type: TransactionType; t: (key: any) => string }) {
  const map: Record<TransactionType, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
    INCOME: { label: t("common.income"), variant: "default" },
    EXPENSE: { label: t("common.expense"), variant: "destructive" },
    TRANSFER: { label: t("common.transfer"), variant: "secondary" },
  };
  const { label, variant } = map[type];
  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0 leading-4">
      {label}
    </Badge>
  );
}

export function RecentTransactions() {
  const wallets = useWalletStore((s) => s.wallets);
  const categories = useCategoryStore((s) => s.categories);
  const { t, locale } = useTranslation();

  const transactions = useRecentTransactions(7);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t("dashboard.recentTransactions")}</CardTitle>
        <Link
          href="/transactions"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("dashboard.noTransactions")}
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const wallet = wallets.find((w) => w.id === tx.walletId);
              const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center h-9 w-9 rounded-full bg-muted shrink-0">
                      {tx.type === "TRANSFER" ? (
                        <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                      ) : category?.icon ? (
                        <IconRenderer name={category.icon} className="h-4 w-4" color={category.color} />
                      ) : (
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tx.description || (tx.type === "TRANSFER" ? t("common.transfer") : category?.name)}
                        </p>
                        <TypeBadge type={tx.type} t={t} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {wallet?.name} &middot; {formatDate(tx.date, undefined, locale)}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold shrink-0 ml-2 ${getTransactionColor(tx.type)}`}>
                    {getTransactionSign(tx.type)}{formatCurrency(tx.amount, tx.currency)}
                    {tx.toAmount && tx.toCurrency && (
                      <span> → {formatCurrency(tx.toAmount, tx.toCurrency)}</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
