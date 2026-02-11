"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transactions/transaction-form";

export function FAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg z-20"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <TransactionForm open={open} onOpenChange={setOpen} />
    </>
  );
}
