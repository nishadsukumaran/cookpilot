"use client";

import Link from "next/link";
import { Clock, Star, Flame, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Recipe } from "@/data/mock-data";

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "default" | "compact" | "featured";
  showAiSummary?: boolean;
  className?: string;
}

export function RecipeCard({
  recipe,
  variant = "default",
  showAiSummary = false,
  className,
}: RecipeCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/recipe/${recipe.id}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
            className
          )}
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-light">
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {recipe.cuisine === "Indian" ? "🍛" : recipe.cuisine === "Arabic" ? "🫓" : recipe.cuisine === "Middle Eastern" ? "🍳" : "🥗"}
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
            <h3 className="truncate font-semibold text-sm">{recipe.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {recipe.cookingTime}m
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber text-amber" />
                {recipe.rating}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/recipe/${recipe.id}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            "group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg",
            className
          )}
        >
          <div className="relative h-48 w-full bg-gradient-to-br from-amber-light to-amber/20">
            <div className="flex h-full w-full items-center justify-center text-6xl">
              {recipe.cuisine === "Indian" ? "🍛" : recipe.cuisine === "Arabic" ? "🫓" : recipe.cuisine === "Middle Eastern" ? "🍳" : "🥗"}
            </div>
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {recipe.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-heading text-xl">{recipe.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <RecipeStatPill icon={<Clock className="h-3.5 w-3.5" />} value={`${recipe.cookingTime}m`} />
              <RecipeStatPill icon={<Flame className="h-3.5 w-3.5" />} value={`${recipe.calories} cal`} />
              <RecipeStatPill icon={<Star className="h-3.5 w-3.5 fill-amber text-amber" />} value={recipe.rating.toString()} />
              <RecipeStatPill icon={<ChefHat className="h-3.5 w-3.5" />} value={recipe.difficulty} />
            </div>
            {showAiSummary && (
              <div className="mt-3 rounded-xl bg-accent/60 p-3 text-xs text-accent-foreground">
                <span className="mr-1 font-semibold text-primary">AI:</span>
                {recipe.aiSummary}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
          className
        )}
      >
        <div className="relative h-36 w-full bg-gradient-to-br from-amber-light to-amber/20">
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {recipe.cuisine === "Indian" ? "🍛" : recipe.cuisine === "Arabic" ? "🫓" : recipe.cuisine === "Middle Eastern" ? "🍳" : "🥗"}
          </div>
          {recipe.tags[0] && (
            <Badge
              variant="secondary"
              className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-sm text-xs"
            >
              {recipe.tags[0]}
            </Badge>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="font-semibold text-sm">{recipe.title}</h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {recipe.cookingTime}m
            </span>
            <span>·</span>
            <span>{recipe.difficulty}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber text-amber" />
              {recipe.rating}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function RecipeStatPill({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      {icon}
      {value}
    </span>
  );
}
