import {
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Coins,
  CircleDollarSign,
  Gem,
  Landmark,
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Home,
  Gamepad2,
  Pill,
  BookOpen,
  Shirt,
  Gift,
  Scissors,
  PawPrint,
  Coffee,
  Briefcase,
  TrendingUp,
  Trophy,
  BarChart3,
  Laptop,
  ArrowLeftRight,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Coins,
  CircleDollarSign,
  Gem,
  Landmark,
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Home,
  Gamepad2,
  Pill,
  BookOpen,
  Shirt,
  Gift,
  Scissors,
  PawPrint,
  Coffee,
  Briefcase,
  TrendingUp,
  Trophy,
  BarChart3,
  Laptop,
  ArrowLeftRight,
  ClipboardList,
};

export function IconRenderer({
  name,
  className = "h-5 w-5",
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} style={color ? { color } : undefined} />;
}
