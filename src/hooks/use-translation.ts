import { useUIStore } from "@/stores/ui-store";

export function useTranslation() {
  const t = useUIStore((s) => s.t);
  const locale = useUIStore((s) => s.locale);
  return { t, locale };
}
