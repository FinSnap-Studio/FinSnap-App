"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Budget } from "@/types";
import { useBudgetStore } from "@/stores/budget-store";
import { useCategoryStore } from "@/stores/category-store";
import { cn, formatCurrency, getBudgetStatus } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";
import { BudgetForm } from "./budget-form";

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const { t } = useTranslation();
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const categories = useCategoryStore((s) => s.categories);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const category = categories.find((c) => c.id === budget.categoryId);
  const pct = Math.min((budget.spent / budget.amount) * 100, 100);
  const status = getBudgetStatus(budget.spent, budget.amount);

  const statusConfig = {
    danger: {
      label: t("budget.statusDanger"),
      classes: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    },
    warning: {
      label: t("budget.statusWarning"),
      classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
    },
    safe: {
      label: t("budget.statusSafe"),
      classes: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    },
  };
  const barIndicatorClass =
    status === "danger"
      ? "[&>div]:bg-red-500"
      : status === "warning"
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-green-500";

  const handleDelete = async () => {
    try {
      await deleteBudget(budget.id);
      toast.success(t("budget.deleteSuccess"));
    } catch {
      toast.error(t("budget.deleteError"));
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                {category?.icon && (
                  <IconRenderer name={category.icon} className="h-4 w-4" color={category.color} />
                )}
              </span>
              <div>
                <p className="font-semibold text-foreground">{category?.name}</p>
                <Badge
                  variant="outline"
                  className={`mt-1 border-transparent ${statusConfig[status].classes}`}
                >
                  {statusConfig[status].label}
                </Badge>
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
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 space-y-2">
            <Progress value={pct} className={cn("h-2", barIndicatorClass)} />
            <p className="text-sm text-muted-foreground">
              {formatCurrency(budget.spent, budget.currency)} /{" "}
              {formatCurrency(budget.amount, budget.currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      <BudgetForm open={editOpen} onOpenChange={setEditOpen} budget={budget} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("budget.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("budget.deleteDesc", { name: category?.name ?? "" })}
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
