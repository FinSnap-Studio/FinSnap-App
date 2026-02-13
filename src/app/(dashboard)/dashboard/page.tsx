"use client";

import { BalanceSummary } from "@/components/dashboard/balance-summary";
import { WalletQuickView } from "@/components/dashboard/wallet-quick-view";
import { MonthlySummary } from "@/components/dashboard/monthly-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { IncomeVsExpenseChart } from "@/components/dashboard/income-vs-expense-chart";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { FAB } from "@/components/dashboard/fab";
import { DebtReminder } from "@/components/debts/debt-reminder";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Balance */}
      <BalanceSummary />

      {/* Wallet quick view */}
      <WalletQuickView />

      {/* Monthly summary cards */}
      <MonthlySummary />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseBreakdown />
        <IncomeVsExpenseChart />
      </div>

      {/* Spending trend (full width) */}
      <SpendingTrendChart />

      {/* Debt reminders */}
      <DebtReminder />

      {/* Recent transactions + Budget overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <BudgetOverview />
      </div>

      <FAB />
    </div>
  );
}
