"use client";

import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTranslation } from "@/hooks/use-translation";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      toast.success(t("common.backOnline"));
    }
  }, [isOnline, t]);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-amber-800 dark:text-amber-200 text-sm">
      <WifiOff className="size-4 shrink-0" />
      <span>{t("common.offlineBanner")}</span>
    </div>
  );
}
