"use client";

import { ShoppingItem, ShoppingList } from "@/types";
import { useCategoryStore } from "@/stores/category-store";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, Circle, Minus, MoreVertical } from "lucide-react";
import { useMemo } from "react";

interface ShoppingItemCardProps {
  item: ShoppingItem;
  list: ShoppingList;
  onEdit: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
  onPurchase: (item: ShoppingItem) => void;
  onSkip: (item: ShoppingItem) => void;
}

export function ShoppingItemCard({
  item,
  list,
  onEdit,
  onRemove,
  onPurchase,
  onSkip,
}: ShoppingItemCardProps) {
  const { t } = useTranslation();
  const categories = useCategoryStore((state) => state.categories);

  const category = useMemo(
    () => (item.categoryId ? categories.find((c) => c.id === item.categoryId) : null),
    [categories, item.categoryId],
  );

  const isCompleted = item.status === "PURCHASED" || item.status === "SKIPPED";

  const statusIcon =
    item.status === "PURCHASED" ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : item.status === "SKIPPED" ? (
      <Minus className="h-5 w-5 text-muted-foreground" />
    ) : (
      <Circle className="h-5 w-5 text-muted-foreground" />
    );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{statusIcon}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <h4
                  className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}
                >
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.quantity > 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{item.quantity}
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  )}
                  {item.status === "PURCHASED" && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {t("shopping.purchased")}
                    </Badge>
                  )}
                  {item.status === "SKIPPED" && (
                    <Badge variant="secondary" className="text-xs">
                      {t("shopping.skipped")}
                    </Badge>
                  )}
                </div>
              </div>

              {item.status === "PENDING" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRemove(item)} className="text-destructive">
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">
                <span className="text-muted-foreground">{t("shopping.estimatedPrice")}: </span>
                <span className="font-medium">
                  {formatCurrency(item.estimatedPrice * item.quantity, list.currency)}
                </span>
                {item.status === "PURCHASED" && item.actualPrice !== null && (
                  <>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className="text-muted-foreground">{t("shopping.actualPrice")}: </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(item.actualPrice, list.currency)}
                    </span>
                  </>
                )}
              </div>

              {item.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onPurchase(item)}>
                    {t("shopping.purchase")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onSkip(item)}>
                    {t("shopping.skip")}
                  </Button>
                </div>
              )}
            </div>

            {item.notes && <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
