"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Wallet } from "@/types";
import { IconRenderer } from "@/lib/icon-map";
import { useWalletStore } from "@/stores/wallet-store";
import { formatCurrency } from "@/lib/utils";
import { WALLET_TYPES } from "@/lib/constants";
import { WalletForm } from "./wallet-form";
import { useTranslation } from "@/hooks/use-translation";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const router = useRouter();
  const deleteWallet = useWalletStore((s) => s.deleteWallet);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { t } = useTranslation();

  const typeKey = WALLET_TYPES.find((wt) => wt.value === wallet.type)?.label;
  const typeLabel = typeKey ? t(typeKey) : wallet.type;

  const handleDelete = async () => {
    try {
      await deleteWallet(wallet.id);
      toast.success(t("wallet.deleteSuccess"));
    } catch {
      toast.error(t("wallet.deleteError"));
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <Card
        className="relative overflow-hidden"
        style={{ borderLeftWidth: 4, borderLeftColor: wallet.color }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted"><IconRenderer name={wallet.icon} className="h-6 w-6" color={wallet.color} /></div>
              <div>
                <p className="font-semibold text-foreground">{wallet.name}</p>
                <Badge variant="secondary" className="mt-1">{typeLabel}</Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/wallets/${wallet.id}`)}>
                  <Eye className="h-4 w-4 mr-2" /> {t("common.viewDetail")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xl font-bold text-foreground mt-3">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
        </CardContent>
      </Card>

      <WalletForm open={editOpen} onOpenChange={setEditOpen} wallet={wallet} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("wallet.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("wallet.deleteDesc", { name: wallet.name })}
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
