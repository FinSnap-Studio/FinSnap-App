"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Category } from "@/types";
import { useCategoryStore } from "@/stores/category-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { IconRenderer } from "@/lib/icon-map";
import { CategoryForm } from "./category-form";
import { useTranslation } from "@/hooks/use-translation";

interface CategoryItemProps {
  category: Category;
}

export function CategoryItem({ category }: CategoryItemProps) {
  const { t } = useTranslation();
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const transactions = useTransactionStore((s) => s.transactions);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hasTransactions = transactions.some((t) => t.categoryId === category.id);
  const canDelete = !category.isDefault && !hasTransactions;

  const handleDelete = async () => {
    try {
      const success = await deleteCategory(category.id);
      if (success) {
        toast.success(t("category.deleteSuccess"));
      } else {
        toast.error(t("category.defaultCannotDelete"));
      }
    } catch {
      toast.error(t("category.deleteError"));
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: category.color + "20" }}
          >
            <IconRenderer name={category.icon} className="h-5 w-5" color={category.color} />
          </div>
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {category.type === "INCOME" ? t("common.income") : t("common.expense")}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
            </DropdownMenuItem>
            {canDelete ? (
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
              </DropdownMenuItem>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {category.isDefault
                        ? t("category.defaultCannotDelete")
                        : t("category.hasTransactions")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CategoryForm open={editOpen} onOpenChange={setEditOpen} category={category} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("category.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("category.deleteDesc", { name: category.name })}
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
    </>
  );
}
