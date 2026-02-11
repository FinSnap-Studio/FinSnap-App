"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { scanReceipt, type OCRResult } from "@/lib/mock-ocr";
import { useTranslation } from "@/hooks/use-translation";

type UploadState = "idle" | "preview" | "scanning" | "done";

interface ReceiptUploadProps {
  onResult: (result: OCRResult) => void;
  disabled?: boolean;
}

export function ReceiptUpload({ onResult, disabled }: ReceiptUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    if (state === "idle") {
      inputRef.current?.click();
    }
  }, [state]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreview(url);
      setState("preview");

      // Brief preview before scanning starts
      await new Promise((r) => setTimeout(r, 300));
      setState("scanning");

      const result = await scanReceipt();
      setState("done");
      toast.success(t("receipt.scanned"));
      onResult(result);

      // Reset file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [onResult, t],
  );

  const handleRemove = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setState("idle");
  }, [preview]);

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {state === "idle" && (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-5 transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Camera className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">{t("receipt.snapReceipt")}</p>
            <p className="text-xs text-muted-foreground">{t("receipt.tapToUpload")}</p>
          </div>
        </button>
      )}

      {(state === "preview" || state === "scanning") && preview && (
        <div className="relative overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="Receipt"
            className="h-32 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium">{t("receipt.scanning")}</span>
            </div>
          </div>
          {/* Shimmer overlay */}
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {state === "done" && preview && (
        <div className="relative flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <img
            src={preview}
            alt="Receipt"
            className="h-12 w-12 rounded object-cover"
          />
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            {t("receipt.scanned")}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="ml-auto h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            {t("receipt.remove")}
          </Button>
        </div>
      )}
    </div>
  );
}
