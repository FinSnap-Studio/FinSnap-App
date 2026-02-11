"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/stores/wallet-store";
import { formatCurrency } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";

export function WalletQuickView() {
  const router = useRouter();
  const allWallets = useWalletStore((s) => s.wallets);
  const wallets = useMemo(() => allWallets.filter((w) => w.isActive), [allWallets]);
  const { t } = useTranslation();

  if (wallets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("dashboard.noWallet")}</p>
    );
  }

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-1">
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          onClick={() => router.push(`/wallets/${wallet.id}`)}
          className="flex-shrink-0 flex items-center gap-3 px-3 py-2 bg-card rounded-lg border hover:bg-accent transition-colors"
          style={{ borderLeftWidth: 4, borderLeftColor: wallet.color }}
        >
          <IconRenderer name={wallet.icon} className="h-6 w-6" color={wallet.color} />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{wallet.name}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(wallet.balance, wallet.currency)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
