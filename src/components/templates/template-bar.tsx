"use client";

import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  ListPlus,
  Plus,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionTemplate } from "@/types";
import { useTemplateStore } from "@/stores/template-store";
import { useWalletStore } from "@/stores/wallet-store";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const TYPE_ICON = {
  INCOME: ArrowDownCircle,
  EXPENSE: ArrowUpCircle,
  TRANSFER: ArrowLeftRight,
} as const;

const TYPE_COLOR = {
  INCOME: "text-green-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-blue-600",
} as const;

interface TemplateBarProps {
  onApply: (template: TransactionTemplate) => void;
  onAdd: () => void;
  onManage: () => void;
}

export function TemplateBar({ onApply, onAdd, onManage }: TemplateBarProps) {
  const templates = useTemplateStore((s) => s.templates);
  const getWalletById = useWalletStore((s) => s.getWalletById);
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{t("template.quickAdd")}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onManage}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {t("template.manage")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Add template button */}
        <button
          type="button"
          onClick={onAdd}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{t("common.add")}</span>
        </button>

        {templates.length === 0 && (
          <div className="flex items-center px-3 py-2 text-sm text-muted-foreground">
            <ListPlus className="h-4 w-4 mr-1.5 flex-shrink-0" />
            {t("template.emptyState")}
          </div>
        )}

        {templates.map((tmpl) => {
          const Icon = TYPE_ICON[tmpl.type];
          const wallet = getWalletById(tmpl.walletId);
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onApply(tmpl)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors text-sm"
            >
              <Icon className={`h-4 w-4 ${TYPE_COLOR[tmpl.type]}`} />
              <span className="font-medium">{tmpl.name}</span>
              {tmpl.amount > 0 && (
                <span className="text-muted-foreground">
                  {formatCurrency(tmpl.amount, wallet?.currency)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
