"use client";

import { useState, useMemo } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ShoppingListCard } from "@/components/shopping/shopping-list-card";
import { ShoppingListForm } from "@/components/shopping/shopping-list-form";
import { ShoppingListSummary } from "@/components/shopping/shopping-list-summary";
import { ShoppingList } from "@/types";
import { useTranslation } from "@/hooks/use-translation";

export default function ShoppingPage() {
  const { t } = useTranslation();
  const shoppingLists = useShoppingStore((s) => s.shoppingLists);
  const deleteShoppingList = useShoppingStore((s) => s.deleteShoppingList);
  const archiveShoppingList = useShoppingStore((s) => s.archiveShoppingList);

  const [formOpen, setFormOpen] = useState(false);
  const [editList, setEditList] = useState<ShoppingList | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShoppingList | null>(null);

  // Filter lists by status with useMemo
  const activeLists = useMemo(
    () => shoppingLists.filter((list) => list.status === "ACTIVE"),
    [shoppingLists],
  );

  const completedLists = useMemo(
    () => shoppingLists.filter((list) => list.status === "COMPLETED"),
    [shoppingLists],
  );

  const archivedLists = useMemo(
    () => shoppingLists.filter((list) => list.status === "ARCHIVED"),
    [shoppingLists],
  );

  const handleEdit = (list: ShoppingList) => {
    setEditList(list);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteShoppingList(deleteTarget.id);
    if (ok) toast.success(t("shopping.deleteSuccess"));
    setDeleteTarget(null);
  };

  const handleArchive = async (list: ShoppingList) => {
    await archiveShoppingList(list.id);
    toast.success(t("shopping.archiveSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("shopping.title")}</h1>
        <Button
          onClick={() => {
            setEditList(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> {t("shopping.addList")}
        </Button>
      </div>

      {/* Summary */}
      <ShoppingListSummary lists={shoppingLists} />

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            {t("shopping.tabActive")} ({activeLists.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("shopping.tabCompleted")} ({completedLists.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            {t("shopping.tabArchived")} ({archivedLists.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t("shopping.emptyState")}</p>
              <Button
                onClick={() => {
                  setEditList(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> {t("shopping.addList")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLists.map((list) => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("shopping.emptyStateCompleted")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedLists.map((list) => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {archivedLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("shopping.emptyStateArchived")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedLists.map((list) => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ShoppingListForm open={formOpen} onOpenChange={setFormOpen} list={editList} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shopping.deleteList")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("shopping.deleteListDesc", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
