"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoryStore } from "@/stores/category-store";
import { CategoryItem } from "@/components/categories/category-item";
import { CategoryForm } from "@/components/categories/category-form";
import { useTranslation } from "@/hooks/use-translation";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const categories = useCategoryStore((s) => s.categories);
  const [formOpen, setFormOpen] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("category.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t("category.addCategory")}
        </Button>
      </div>

      <Tabs defaultValue="EXPENSE">
        <TabsList>
          <TabsTrigger value="EXPENSE">{t("common.expense")} ({expenseCategories.length})</TabsTrigger>
          <TabsTrigger value="INCOME">{t("common.income")} ({incomeCategories.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="EXPENSE" className="mt-4">
          {expenseCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("category.noExpense")}</p>
          ) : (
            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="INCOME" className="mt-4">
          {incomeCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("category.noIncome")}</p>
          ) : (
            <div className="space-y-2">
              {incomeCategories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
