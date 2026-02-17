"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MoreVertical, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useShoppingStore } from "@/stores/shopping-store";
import { useWalletStore } from "@/stores/wallet-store";
import { ShoppingItemCard } from "@/components/shopping/shopping-item-card";
import { ShoppingItemForm } from "@/components/shopping/shopping-item-form";
import { ShoppingPurchaseDialog } from "@/components/shopping/shopping-purchase-dialog";
import { ShoppingItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function ShoppingListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();

  const shoppingLists = useShoppingStore((s) => s.shoppingLists);
  const archiveShoppingList = useShoppingStore((s) => s.archiveShoppingList);
  const removeItem = useShoppingStore((s) => s.removeItem);
  const skipItem = useShoppingStore((s) => s.skipItem);
  const purchaseAllRemaining = useShoppingStore((s) => s.purchaseAllRemaining);
  const markItemPending = useShoppingStore((s) => s.markItemPending);

  const wallets = useWalletStore((s) => s.wallets);

  const list = useMemo(() => shoppingLists.find((l) => l.id === id), [shoppingLists, id]);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<ShoppingItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<ShoppingItem | null>(null);
  const [purchaseAllOpen, setPurchaseAllOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Computed values
  const estimatedTotal = useMemo(() => {
    if (!list) return 0;
    return list.items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  }, [list]);

  const actualSpent = useMemo(() => {
    if (!list) return 0;
    return list.items.reduce((sum, item) => {
      if (item.status === "PURCHASED" && item.actualPrice !== null) {
        return sum + item.actualPrice;
      }
      return sum;
    }, 0);
  }, [list]);

  const pendingItems = useMemo(() => {
    if (!list) return [];
    return list.items.filter((item) => item.status === "PENDING");
  }, [list]);

  // Progress includes both PURCHASED and SKIPPED
  const progress = useMemo(() => {
    if (!list || list.items.length === 0) return 0;
    const completedCount = list.items.filter(
      (item) => item.status === "PURCHASED" || item.status === "SKIPPED",
    ).length;
    return Math.round((completedCount / list.items.length) * 100);
  }, [list]);

  const purchasedCount = useMemo(() => {
    if (!list) return 0;
    return list.items.filter((item) => item.status === "PURCHASED").length;
  }, [list]);

  // Sort items: PENDING first, then PURCHASED, then SKIPPED
  const sortedItems = useMemo(() => {
    if (!list) return [];
    return [...list.items].sort((a, b) => {
      const statusOrder = { PENDING: 0, PURCHASED: 1, SKIPPED: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [list]);

  const wallet = useMemo(() => {
    if (!list) return undefined;
    return wallets.find((w) => w.id === list.walletId);
  }, [list, wallets]);

  const handleEditItem = (item: ShoppingItem) => {
    setEditItem(item);
    setItemFormOpen(true);
  };

  const handleRemoveItem = async () => {
    if (!deleteItemTarget || !list) return;
    const ok = await removeItem(list.id, deleteItemTarget.id);
    if (ok) toast.success(t("shopping.removeItem"));
    setDeleteItemTarget(null);
  };

  const handleSkipItem = async (item: ShoppingItem) => {
    if (!list) return;
    await skipItem(list.id, item.id);
    toast.success(t("shopping.skip"));
  };

  const handleMarkPending = async (item: ShoppingItem) => {
    if (!list) return;
    await markItemPending(list.id, item.id);
    toast.success(t("shopping.markPending"));
  };

  const handleArchive = async () => {
    if (!list) return;
    await archiveShoppingList(list.id);
    toast.success(t("shopping.archiveSuccess"));
    setArchiveOpen(false);
    router.push("/shopping");
  };

  const handlePurchaseAll = async () => {
    if (!list) return;
    const count = await purchaseAllRemaining(list.id);
    toast.success(t("shopping.purchasedCount", { count }));
    setPurchaseAllOpen(false);
  };

  if (!list) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("shopping.notFound")}</p>
        <Button variant="link" onClick={() => router.push("/shopping")}>
          {t("shopping.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/shopping")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t("shopping.backToList")}
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{list.name}</h1>
            </div>
            {wallet && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{wallet.name}</Badge>
                <Badge variant="outline">{list.currency}</Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => {
                setEditItem(null);
                setItemFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> {t("shopping.addItem")}
            </Button>

            {list.status === "ACTIVE" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                    {t("shopping.archive")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {pendingItems.length > 0 && (
              <Button variant="default" onClick={() => setPurchaseAllOpen(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" /> {t("shopping.purchaseAll")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("shopping.progress", {
                  purchased: purchasedCount,
                  total: list.items.length,
                })}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">{t("shopping.estimatedTotal")}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(estimatedTotal, list.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("shopping.actualSpent")}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(actualSpent, list.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("shopping.itemsRemaining", { count: pendingItems.length })}
              </p>
              <p className="text-lg font-bold text-foreground">{pendingItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("shopping.itemsSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          {list.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("shopping.noItems")}
            </p>
          ) : (
            <div className="space-y-3">
              {sortedItems.map((item) => (
                <ShoppingItemCard
                  key={item.id}
                  item={item}
                  list={list}
                  onEdit={handleEditItem}
                  onRemove={setDeleteItemTarget}
                  onPurchase={setPurchaseItem}
                  onSkip={handleSkipItem}
                  onMarkPending={handleMarkPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ShoppingItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        listId={list.id}
        item={editItem}
        currency={list.currency}
      />

      <ShoppingPurchaseDialog
        open={!!purchaseItem}
        onOpenChange={(open) => !open && setPurchaseItem(null)}
        item={purchaseItem}
        list={list}
      />

      {/* Delete item confirmation */}
      <AlertDialog
        open={!!deleteItemTarget}
        onOpenChange={(open) => !open && setDeleteItemTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shopping.removeItem")}</AlertDialogTitle>
            <AlertDialogDescription>{t("shopping.removeItemDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Purchase all confirmation */}
      <AlertDialog open={purchaseAllOpen} onOpenChange={setPurchaseAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shopping.purchaseAll")}</AlertDialogTitle>
            <AlertDialogDescription>{t("shopping.purchaseAllDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePurchaseAll}>
              {t("shopping.purchaseConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive confirmation */}
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shopping.archive")}</AlertDialogTitle>
            <AlertDialogDescription>{t("shopping.archiveSuccess")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>{t("shopping.archive")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
