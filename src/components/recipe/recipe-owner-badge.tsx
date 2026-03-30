import { BookOpen, Layers, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeOwnerBadgeProps {
  type: "original" | "variant" | "my-recipe";
  sourceName?: string;
  className?: string;
}

const config = {
  original: {
    label: "Original Recipe",
    icon: BookOpen,
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-700",
    iconColor: "text-gray-500",
  },
  variant: {
    label: "My Version",
    icon: Layers,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    iconColor: "text-blue-600",
  },
  "my-recipe": {
    label: "My Recipe",
    icon: ChefHat,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-600",
  },
};

export function RecipeOwnerBadge({
  type,
  sourceName,
  className,
}: RecipeOwnerBadgeProps) {
  const { label, icon: Icon, bg, text, iconColor } = config[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        bg,
        text,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      {label}
      {sourceName && type !== "original" && (
        <span className="opacity-70">&middot; Based on {sourceName}</span>
      )}
    </span>
  );
}
