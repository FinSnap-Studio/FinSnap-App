"use client";

import { ShoppingList } from "@/types";
import { useWalletStore } from "@/stores/wallet-store";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Archive, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ShoppingListCardProps {
  list: ShoppingList;
  onEdit: (list: ShoppingList) => void;
  onDelete: (list: ShoppingList) => void;
  onArchive: (list: ShoppingList) => void;
}

export function ShoppingListCard({ list, onEdit, onDelete, onArchive }: ShoppingListCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const wallets = useWalletStore((state) => state.wallets);

  const wallet = useMemo(
    () => wallets.find((w) => w.id === list.walletId),
    [wallets, list.walletId],
  );

  const estimatedTotal = useMemo(
    () => list.items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0),
    [list.items],
  );

  const actualSpent = useMemo(
    () =>
      list.items
        .filter((item) => item.status === "PURCHASED" && item.actualPrice !== null)
        .reduce((sum, item) => sum + (item.actualPrice || 0), 0),
    [list.items],
  );

  const itemsRemaining = useMemo(
    () => list.items.filter((item) => item.status === "PENDING").length,
    [list.items],
  );

  const purchasedCount = useMemo(
    () => list.items.filter((item) => item.status === "PURCHASED").length,
    [list.items],
  );

  const completedCount = useMemo(
    () =>
      list.items.filter((item) => item.status === "PURCHASED" || item.status === "SKIPPED").length,
    [list.items],
  );

  const progress = list.items.length > 0 ? (completedCount / list.items.length) * 100 : 0;

  const statusConfig = {
    ACTIVE: {
      label: t("shopping.tabActive"),
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    COMPLETED: {
      label: t("shopping.tabCompleted"),
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    ARCHIVED: {
      label: t("shopping.tabArchived"),
      className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    },
  } as const;
  const status = statusConfig[list.status];

  const handleCardClick = () => {
    router.push(`/shopping/${list.id}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        (list.status === "COMPLETED" || list.status === "ARCHIVED") && "opacity-60",
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{list.name}</h3>
              <Badge variant="secondary" className={status.className}>
                {status.label}
              </Badge>
            </div>
            {wallet && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>{wallet.name}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(list);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
              </DropdownMenuItem>
              {list.status === "ACTIVE" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(list);
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" /> {t("shopping.archive")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(list);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {t("shopping.progress", { purchased: purchasedCount, total: list.items.length })}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("shopping.estimatedTotal")}</p>
              <p className="font-semibold">{formatCurrency(estimatedTotal, list.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("shopping.actualSpent")}</p>
              <p className="font-semibold">{formatCurrency(actualSpent, list.currency)}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {t("shopping.itemsRemaining", { count: itemsRemaining })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
