"use client";

import { useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

const messages = {
  id: {
    title: "Kamu sedang offline",
    desc: "Data yang sudah tersimpan tetap bisa diakses. Kembali ke halaman sebelumnya.",
    retry: "Coba Lagi",
    back: "Kembali ke Dashboard",
  },
  en: {
    title: "You are offline",
    desc: "Your saved data is still accessible. Go back to the previous page.",
    retry: "Try Again",
    back: "Back to Dashboard",
  },
};

export default function OfflinePage() {
  const [locale] = useState<"id" | "en">(() => {
    if (typeof window === "undefined") return "id";
    try {
      const stored = localStorage.getItem("finsnap-locale");
      if (stored === "en" || stored === "id") return stored;
    } catch {}
    return "id";
  });

  const m = messages[locale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <WifiOff className="size-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-3">{m.title}</h1>
      <p className="text-muted-foreground max-w-xs mb-8 leading-relaxed">{m.desc}</p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
        >
          {m.retry}
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {m.back}
        </Link>
      </div>
    </div>
  );
}
