"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useBudgetStore } from "@/stores/budget-store";
import { useTemplateStore } from "@/stores/template-store";
import { useRecurringStore } from "@/stores/recurring-store";
import { useDebtStore } from "@/stores/debt-store";
import { AppSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const fetchWallets = useWalletStore((s) => s.fetchWallets);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);
  const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);
  const fetchRecurring = useRecurringStore((s) => s.fetchRecurring);
  const processRecurringTransactions = useRecurringStore((s) => s.processRecurringTransactions);
  const fetchDebts = useDebtStore((s) => s.fetchDebts);
  const { t } = useTranslation();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      const now = new Date();
      await Promise.all([
        fetchWallets(),
        fetchCategories(),
        fetchTransactions(),
        fetchBudgets(now.getMonth() + 1, now.getFullYear()),
        fetchTemplates(),
        fetchRecurring(),
        fetchDebts(),
      ]);

      // Process recurring transactions after all data is loaded
      const result = await processRecurringTransactions();
      if (result.created > 0) {
        if (result.processed === 1) {
          toast.info(t("recurring.processedSingle", { count: result.created }));
        } else {
          toast.info(
            t("recurring.processedMultiple", { count: result.created, sources: result.processed }),
          );
        }
      }

      setDataLoaded(true);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    authLoading,
    router,
    fetchWallets,
    fetchCategories,
    fetchTransactions,
    fetchBudgets,
    fetchTemplates,
    fetchRecurring,
    fetchDebts,
  ]);

  if (authLoading || (!dataLoaded && isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
