"use client";

import { useState, useMemo } from "react";
import { Plus, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet-store";
import { WalletCard } from "@/components/wallets/wallet-card";
import { WalletForm } from "@/components/wallets/wallet-form";
import { TransferForm } from "@/components/wallets/transfer-form";
import { useTranslation } from "@/hooks/use-translation";

export default function WalletsPage() {
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("wallet.title")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="h-4 w-4 mr-2" /> {t("common.transfer")}
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("wallet.addWallet")}
          </Button>
        </div>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("wallet.emptyState")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      )}

      <WalletForm open={formOpen} onOpenChange={setFormOpen} />
      <TransferForm open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
