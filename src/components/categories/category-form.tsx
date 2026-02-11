"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategorySchema } from "@/lib/validations/category";
import { EXPENSE_ICONS, INCOME_ICONS, PRESET_COLORS } from "@/lib/constants";
import { Category, CategoryFormInput } from "@/types";
import { useCategoryStore } from "@/stores/category-store";
import { cn, mergeRefs } from "@/lib/utils";
import { IconRenderer } from "@/lib/icon-map";
import { useTranslation } from "@/hooks/use-translation";
import { useAutoFocus } from "@/hooks/use-auto-focus";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const { t } = useTranslation();
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const isEditing = !!category;
  const autoFocusRef = useAutoFocus<HTMLInputElement>(open);

  const schema = useMemo(() => createCategorySchema(t), [t]);

  const form = useForm<CategoryFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: "UtensilsCrossed",
      color: "#6366f1",
    },
  });

  const watchType = form.watch("type");
  const icons = watchType === "INCOME" ? INCOME_ICONS : EXPENSE_ICONS;

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          type: category.type as "INCOME" | "EXPENSE",
          icon: category.icon,
          color: category.color,
        });
      } else {
        form.reset({
          name: "",
          type: "EXPENSE",
          icon: "UtensilsCrossed",
          color: "#6366f1",
        });
      }
    }
  }, [open, category, form]);

  // Reset icon when type changes
  useEffect(() => {
    const currentIcon = form.getValues("icon");
    const currentIcons = watchType === "INCOME" ? INCOME_ICONS : EXPENSE_ICONS;
    if (!(currentIcons as readonly string[]).includes(currentIcon)) {
      form.setValue("icon", currentIcons[0]);
    }
  }, [watchType, form]);

  const onSubmit = async (data: CategoryFormInput) => {
    try {
      if (isEditing) {
        await updateCategory(category.id, data);
        toast.success(t("category.updateSuccess"));
      } else {
        await addCategory(data);
        toast.success(t("category.addSuccess"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("category.saveError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("category.editCategory") : t("category.addCategory")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("common.name")}</Label>
            <Input
              placeholder={t("category.namePlaceholder")}
              {...form.register("name")}
              ref={mergeRefs(autoFocusRef, form.register("name").ref)}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("common.type")}</Label>
            <Select
              value={watchType}
              onValueChange={(val) => form.setValue("type", val as "INCOME" | "EXPENSE")}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">{t("common.expense")}</SelectItem>
                <SelectItem value="INCOME">{t("common.income")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("common.icon")}</Label>
            <div className="grid grid-cols-8 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => form.setValue("icon", icon)}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-md border transition-colors",
                    form.watch("icon") === icon
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-accent/50"
                  )}
                >
                  <IconRenderer name={icon} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("common.color")}</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => form.setValue("color", color)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    form.watch("color") === color
                      ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                      : ""
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("common.saving") : isEditing ? t("common.update") : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
