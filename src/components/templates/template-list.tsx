"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { TransactionTemplate } from "@/types";
import { useTemplateStore } from "@/stores/template-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { formatCurrency, getTransactionColor, getTransactionSign } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { TemplateForm } from "./template-form";

interface TemplateListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateList({ open, onOpenChange }: TemplateListProps) {
  const templates = useTemplateStore((s) => s.templates);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const getWalletById = useWalletStore((s) => s.getWalletById);
  const categories = useCategoryStore((s) => s.categories);
  const { t } = useTranslation();

  const [editingTemplate, setEditingTemplate] = useState<TransactionTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<TransactionTemplate | null>(null);

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await deleteTemplate(deletingTemplate.id);
      toast.success(t("template.deleteSuccess"));
    } catch {
      toast.error(t("template.deleteError"));
    }
    setDeletingTemplate(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>{t("template.title")}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("template.emptyState")}
              </p>
            ) : (
              templates.map((tmpl) => {
                const wallet = getWalletById(tmpl.walletId);
                const category = categories.find((c) => c.id === tmpl.categoryId);

                return (
                  <div
                    key={tmpl.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{tmpl.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tmpl.type === "TRANSFER" ? t("common.transfer") : category?.name ?? "—"} · {wallet?.name ?? "—"}
                      </p>
                      <p className={`text-sm font-semibold ${getTransactionColor(tmpl.type)}`}>
                        {getTransactionSign(tmpl.type)}{formatCurrency(tmpl.amount, wallet?.currency)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTemplate(tmpl)}>
                          <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingTemplate(tmpl)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Template */}
      <TemplateForm
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        template={editingTemplate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("template.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("template.deleteDesc", { name: deletingTemplate?.name ?? "" })}
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
