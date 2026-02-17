"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowLeftRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTransactionsByWallet } from "@/hooks/use-transaction-computed";
import { formatCurrency, formatDate, getTransactionColor, getTransactionSign } from "@/lib/utils";
import { WALLET_TYPES } from "@/lib/constants";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";

export default function WalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;
  const { t, locale } = useTranslation();

  const getWalletById = useWalletStore((s) => s.getWalletById);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);

  const wallet = getWalletById(walletId);
  const transactions = useTransactionsByWallet(walletId);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const { monthIncome, monthExpense } = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.walletId !== walletId) continue;
      const d = new Date(tx.date);
      if (d.getMonth() !== curMonth || d.getFullYear() !== curYear) continue;
      if (tx.type === "INCOME") income += tx.amount;
      else if (tx.type === "EXPENSE") expense += tx.amount;
    }
    return { monthIncome: income, monthExpense: expense };
  }, [transactions, walletId]);

  if (!wallet) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("wallet.notFound")}</p>
        <Button variant="link" onClick={() => router.push("/wallets")}>
          {t("wallet.backToList")}
        </Button>
      </div>
    );
  }

  const typeKey = WALLET_TYPES.find((wt) => wt.value === wallet.type)?.label;
  const typeLabel = typeKey ? t(typeKey) : wallet.type;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/wallets")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Button>

      <Card style={{ borderLeftWidth: 4, borderLeftColor: wallet.color }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted">
              <IconRenderer name={wallet.icon} className="h-7 w-7" color={wallet.color} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{wallet.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{typeLabel}</Badge>
                <Badge variant="outline">{wallet.currency}</Badge>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-4">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">{t("wallet.incomeThisMonth")}</p>
            </div>
            <p className="text-lg font-bold text-green-600 mt-1">
              {formatCurrency(monthIncome, wallet.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm text-muted-foreground">{t("wallet.expenseThisMonth")}</p>
            </div>
            <p className="text-lg font-bold text-red-600 mt-1">
              {formatCurrency(monthExpense, wallet.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("nav.transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("transaction.noWalletTransactions")}
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
                const toWallet = wallets.find((w) => w.id === tx.toWalletId);
                const sourceWallet = wallets.find((w) => w.id === tx.walletId);

                const isDestination = tx.type === "TRANSFER" && tx.toWalletId === walletId;
                const displayAmount = isDestination && tx.toAmount ? tx.toAmount : tx.amount;
                const displayCurrency =
                  isDestination && tx.toCurrency ? tx.toCurrency : tx.currency;

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                        {tx.type === "TRANSFER" ? (
                          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                        ) : category?.icon ? (
                          <IconRenderer
                            name={category.icon}
                            className="h-4 w-4"
                            color={category.color}
                          />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.description || category?.name || t("common.transfer")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.date, undefined, locale)}
                          {tx.type === "TRANSFER" && toWallet && (
                            <>
                              {" "}
                              &middot;{" "}
                              {tx.walletId === walletId
                                ? `→ ${toWallet.name}`
                                : `← ${sourceWallet?.name}`}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                      {getTransactionSign(tx.type)}
                      {formatCurrency(displayAmount, displayCurrency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
