"use client";

import { ShoppingList } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, TrendingDown, Package } from "lucide-react";
import { useMemo } from "react";

interface ShoppingListSummaryProps {
  lists: ShoppingList[];
}

export function ShoppingListSummary({ lists }: ShoppingListSummaryProps) {
  const { t } = useTranslation();

  const activeLists = useMemo(() => lists.filter((list) => list.status === "ACTIVE"), [lists]);

  const activeListsCount = activeLists.length;

  const totalEstimated = useMemo(
    () =>
      activeLists.reduce((sum, list) => {
        const listTotal = list.items.reduce(
          (itemSum, item) => itemSum + item.estimatedPrice * item.quantity,
          0,
        );
        return sum + listTotal;
      }, 0),
    [activeLists],
  );

  const itemsRemaining = useMemo(
    () =>
      activeLists.reduce((sum, list) => {
        const pendingCount = list.items.filter((item) => item.status === "PENDING").length;
        return sum + pendingCount;
      }, 0),
    [activeLists],
  );

  const currencies = useMemo(() => [...new Set(activeLists.map((l) => l.currency))], [activeLists]);
  const isMixedCurrency = currencies.length > 1;
  const currency = currencies[0] || "IDR";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("shopping.totalLists")}
              </p>
              <p className="text-2xl font-bold">{activeListsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("shopping.totalEstimated")}
              </p>
              {isMixedCurrency ? (
                <p className="text-lg font-bold text-muted-foreground">
                  {t("shopping.mixedCurrencies")}
                </p>
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(totalEstimated, currency)}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("shopping.totalItems")}
              </p>
              <p className="text-2xl font-bold">{itemsRemaining}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
