"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeftRight, MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
import { IconRenderer } from "@/lib/icon-map";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Transaction } from "@/types";
import { useTransactionStore } from "@/stores/transaction-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { formatCurrency, formatDate, getTransactionColor, getTransactionSign } from "@/lib/utils";
import { TransactionForm } from "./transaction-form";
import { useTranslation } from "@/hooks/use-translation";
import { useFilteredTransactions } from "@/hooks/use-filtered-transactions";

const PAGE_SIZE = 10;

export function TransactionList() {
  const filters = useTransactionStore((s) => s.filters);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const getWalletById = useWalletStore((s) => s.getWalletById);
  const categories = useCategoryStore((s) => s.categories);
  const { t, locale } = useTranslation();

  const allTransactions = useFilteredTransactions();

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const [page, setPage] = useState(1);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Reset page to 1 when filters change
  const filtersRef = useRef(filters);
  useEffect(() => {
    if (filtersRef.current !== filters) {
      filtersRef.current = filters;
      setPage(1); // eslint-disable-line react-hooks/set-state-in-effect -- intentional: reset pagination when filters change
    }
  }, [filters]);
  const totalPages = Math.max(1, Math.ceil(allTransactions.length / PAGE_SIZE));
  const paginatedTransactions = allTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deletingTx) return;
    try {
      await deleteTransaction(deletingTx.id);
      toast.success(t("transaction.deleteSuccess"));
    } catch {
      toast.error(t("transaction.deleteError"));
    }
    setDeletingTx(null);
  };

  if (allTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("transaction.noTransactions")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("transaction.tableDate")}</TableHead>
              <TableHead>{t("transaction.tableCategory")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("transaction.tableDesc")}</TableHead>
              <TableHead>{t("transaction.tableWallet")}</TableHead>
              <TableHead className="text-right">{t("transaction.tableAmount")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((tx) => {
              const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
              const wallet = getWalletById(tx.walletId);
              const toWallet = tx.toWalletId ? getWalletById(tx.toWalletId) : null;

              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{formatDate(tx.date, "dd/MM", locale)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <span className="flex items-center">
                        {tx.type === "TRANSFER" ? (
                          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                        ) : category?.icon ? (
                          <IconRenderer
                            name={category.icon}
                            className="h-4 w-4"
                            color={category.color}
                          />
                        ) : null}
                      </span>
                      <span className="text-sm">
                        {tx.type === "TRANSFER" ? t("common.transfer") : category?.name}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {tx.description}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.type === "TRANSFER" ? `${wallet?.name} → ${toWallet?.name}` : wallet?.name}
                  </TableCell>
                  <TableCell
                    className={`text-right text-sm font-semibold ${getTransactionColor(tx.type)}`}
                  >
                    {getTransactionSign(tx.type)}
                    {formatCurrency(tx.amount, tx.currency)}
                    {tx.toAmount && tx.toCurrency && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        → {formatCurrency(tx.toAmount, tx.toCurrency)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTx(tx)}>
                          <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingTx(tx)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {t("common.pageOf", { page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      <TransactionForm
        open={!!editingTx}
        onOpenChange={(open) => !open && setEditingTx(null)}
        transaction={editingTx}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingTx} onOpenChange={(open) => !open && setDeletingTx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transaction.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("transaction.deleteDesc")}</AlertDialogDescription>
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
