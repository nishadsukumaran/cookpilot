"use client";

import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/data/mock-data";

interface IngredientRowProps {
  ingredient: Ingredient;
  onSubstitute?: () => void;
  isModified?: boolean;
  className?: string;
}

const categoryColors: Record<string, string> = {
  protein: "bg-red-100 text-red-700",
  dairy: "bg-blue-100 text-blue-700",
  spice: "bg-amber-100 text-amber-700",
  vegetable: "bg-green-100 text-green-700",
  grain: "bg-yellow-100 text-yellow-700",
  oil: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

export function IngredientRow({
  ingredient,
  onSubstitute,
  isModified = false,
  className,
}: IngredientRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 border-b border-border/50 last:border-0",
        isModified && "bg-amber-light/30 -mx-3 px-3 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-2 w-2 rounded-full",
            categoryColors[ingredient.category]?.split(" ")[0] || "bg-gray-100"
          )}
        />
        <span className="text-sm">{ingredient.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tabular-nums text-foreground">
          {ingredient.amount} {ingredient.unit}
        </span>
        {onSubstitute && (
          <button
            onClick={onSubstitute}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            aria-label={`Find substitute for ${ingredient.name}`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
