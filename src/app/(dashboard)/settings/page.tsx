"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  User,
  Palette,
  Database,
  LogOut,
  Check,
  Coins,
  Languages,
  Plus,
  RotateCcw,
  Smartphone,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { CurrencySelect } from "@/components/ui/currency-select";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useBudgetStore } from "@/stores/budget-store";
import { useCategoryStore } from "@/stores/category-store";
import { useTemplateStore } from "@/stores/template-store";
import { useRecurringStore } from "@/stores/recurring-store";
import { useDebtStore } from "@/stores/debt-store";
import { useShoppingStore } from "@/stores/shopping-store";
import { COLOR_THEMES } from "@/lib/themes";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { useTranslation } from "@/hooks/use-translation";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { storageClearAllData } from "@/lib/storage";
import {
  MOCK_WALLETS,
  MOCK_TRANSACTIONS,
  MOCK_BUDGETS,
  MOCK_CATEGORIES,
  MOCK_TEMPLATES,
  MOCK_RECURRING,
  MOCK_DEBTS,
  MOCK_SHOPPING_LISTS,
} from "@/data/mock-data";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const {
    theme,
    toggleTheme,
    colorTheme,
    setColorTheme,
    defaultCurrency,
    setDefaultCurrency,
    locale,
    setLocale,
  } = useUIStore();
  const { t } = useTranslation();

  const { isInstallable, promptInstall } = useInstallPrompt();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [clearDataOpen, setClearDataOpen] = useState(false);
  const [demoDataOpen, setDemoDataOpen] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error(t("settings.profileError"));
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim() });
    toast.success(t("settings.profileSuccess"));
  };

  const handleClearData = () => {
    storageClearAllData();
    useTransactionStore.setState({ transactions: [] });
    useWalletStore.setState({ wallets: [] });
    useBudgetStore.setState({ budgets: [] });
    useCategoryStore.setState({ categories: [] });
    useTemplateStore.setState({ templates: [] });
    useRecurringStore.setState({ recurrings: [] });
    useDebtStore.setState({ debts: [] });
    useShoppingStore.setState({ shoppingLists: [] });
    toast.success(t("settings.clearDataSuccess"));
  };

  const handleAddDemoData = () => {
    const wallets = useWalletStore.getState().wallets;
    const transactions = useTransactionStore.getState().transactions;
    const budgets = useBudgetStore.getState().budgets;
    const categories = useCategoryStore.getState().categories;

    // Merge mock categories (skip duplicates by name+type)
    const existingCatKeys = new Set(categories.map((c) => `${c.name}|${c.type}`));
    const newCats = MOCK_CATEGORIES.filter((c) => !existingCatKeys.has(`${c.name}|${c.type}`));
    if (newCats.length > 0) {
      useCategoryStore.setState({ categories: [...categories, ...newCats] });
    }

    // Merge mock wallets (skip duplicate by ID)
    const existingWalletIds = new Set(wallets.map((w) => w.id));
    const newWallets = MOCK_WALLETS.filter((w) => !existingWalletIds.has(w.id));
    if (newWallets.length > 0) {
      useWalletStore.setState({ wallets: [...wallets, ...newWallets] });
    }

    // Merge mock transactions (skip duplicate by ID)
    const existingTxIds = new Set(transactions.map((t) => t.id));
    const newTxs = MOCK_TRANSACTIONS.filter((t) => !existingTxIds.has(t.id));
    if (newTxs.length > 0) {
      useTransactionStore.setState({ transactions: [...newTxs, ...transactions] });
    }

    // Merge mock budgets (skip duplicate by ID)
    const existingBudgetIds = new Set(budgets.map((b) => b.id));
    const newBudgets = MOCK_BUDGETS.filter((b) => !existingBudgetIds.has(b.id));
    if (newBudgets.length > 0) {
      useBudgetStore.setState({ budgets: [...budgets, ...newBudgets] });
    }

    // Merge mock templates (skip duplicate by ID)
    const templates = useTemplateStore.getState().templates;
    const existingTemplateIds = new Set(templates.map((t) => t.id));
    const newTemplates = MOCK_TEMPLATES.filter((t) => !existingTemplateIds.has(t.id));
    if (newTemplates.length > 0) {
      useTemplateStore.setState({ templates: [...templates, ...newTemplates] });
    }

    // Merge mock recurring (skip duplicate by ID)
    const recurrings = useRecurringStore.getState().recurrings;
    const existingRecIds = new Set(recurrings.map((r) => r.id));
    const newRec = MOCK_RECURRING.filter((r) => !existingRecIds.has(r.id));
    if (newRec.length > 0) {
      useRecurringStore.setState({ recurrings: [...recurrings, ...newRec] });
    }

    // Merge mock debts (skip duplicate by ID)
    const debts = useDebtStore.getState().debts;
    const existingDebtIds = new Set(debts.map((d) => d.id));
    const newDebts = MOCK_DEBTS.filter((d) => !existingDebtIds.has(d.id));
    if (newDebts.length > 0) {
      useDebtStore.setState({ debts: [...debts, ...newDebts] });
    }

    // Merge mock shopping lists (skip duplicate by ID)
    const shoppingLists = useShoppingStore.getState().shoppingLists;
    const existingSlIds = new Set(shoppingLists.map((s) => s.id));
    const newSl = MOCK_SHOPPING_LISTS.filter((s) => !existingSlIds.has(s.id));
    if (newSl.length > 0) {
      useShoppingStore.setState({ shoppingLists: [...shoppingLists, ...newSl] });
    }

    toast.success(t("settings.addDemoSuccess"));
  };

  const handleAddDefaultCategories = () => {
    const categories = useCategoryStore.getState().categories;
    const existingKeys = new Set(categories.map((c) => `${c.name}|${c.type}`));
    const missing = MOCK_CATEGORIES.filter((c) => !existingKeys.has(`${c.name}|${c.type}`));

    if (missing.length === 0) {
      toast.info(t("settings.defaultCategoriesExist"));
      return;
    }

    useCategoryStore.setState({ categories: [...categories, ...missing] });
    toast.success(t("settings.addDefaultCategoriesSuccess"));
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("settings.account")}
          </CardTitle>
          <CardDescription>{t("settings.accountDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("common.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("settings.emailPlaceholder")}
            />
          </div>
          <Button onClick={handleSaveProfile}>{t("settings.saveProfile")}</Button>
        </CardContent>
      </Card>

      {/* Currency Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t("settings.currency")}
          </CardTitle>
          <CardDescription>{t("settings.currencyDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.defaultCurrency")}</Label>
            <CurrencySelect value={defaultCurrency} onValueChange={setDefaultCurrency} />
            <p className="text-xs text-muted-foreground">{t("settings.currencyHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("settings.language")}
          </CardTitle>
          <CardDescription>{t("settings.languageDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {LOCALE_OPTIONS.map((opt) => (
              <Button
                key={opt.code}
                variant={locale === opt.code ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocale(opt.code)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t("settings.appearance")}
          </CardTitle>
          <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode light/dark */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t("settings.mode")}</Label>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="flex-1"
                onClick={() => theme !== "light" && toggleTheme()}
              >
                <Sun className="h-4 w-4 mr-2" />
                {t("settings.light")}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="flex-1"
                onClick={() => theme !== "dark" && toggleTheme()}
              >
                <Moon className="h-4 w-4 mr-2" />
                {t("settings.dark")}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Color Theme */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t("settings.colorTheme")}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {COLOR_THEMES.map((themeItem) => {
                const isActive = colorTheme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    onClick={() => setColorTheme(themeItem.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent/50 ${
                      isActive ? "border-primary bg-accent/30" : "border-border"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <span
                        className="h-6 w-6 rounded-full border border-border/50"
                        style={{ background: themeItem.previewColors.primary }}
                      />
                      <span
                        className="h-6 w-6 rounded-full border border-border/50"
                        style={{ background: themeItem.previewColors.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium">{themeItem.name}</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {t(themeItem.descriptionKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("settings.data")}
          </CardTitle>
          <CardDescription>{t("settings.dataDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.addDemoData")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.addDemoDataDesc")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDemoDataOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t("settings.addDemoDataButton")}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.addDefaultCategories")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.addDefaultCategoriesDesc")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddDefaultCategories}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("settings.addDefaultCategoriesButton")}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.clearData")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.clearDataDesc")}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setClearDataOpen(true)}>
              {t("settings.clearDataButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Install App */}
      {isInstallable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {t("settings.installApp")}
            </CardTitle>
            <CardDescription>{t("settings.installAppDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={promptInstall}>
              <Download className="h-4 w-4 mr-2" />
              {t("settings.installAppButton")}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Logout */}
      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        {t("settings.logoutButton")}
      </Button>

      {/* Add Demo Data Dialog */}
      <AlertDialog open={demoDataOpen} onOpenChange={setDemoDataOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.addDemoTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.addDemoConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddDemoData}>
              {t("settings.addDemoDataButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Data Dialog */}
      <AlertDialog open={clearDataOpen} onOpenChange={setClearDataOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.clearDataTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.clearDataConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
              {t("settings.clearDataYes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
