"use client";

import Link from "next/link";
import { Clock, Star, ChefHat, Flame, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Recipe } from "@/data/mock-data";

interface RecipeDiscoveryCardProps {
  recipe: Recipe;
  rank: number;
  className?: string;
}

const rankLabels = ["Best Match", "Runner Up", "Also Great"];
const cuisineEmoji: Record<string, string> = {
  Indian: "🍛",
  Arabic: "🫓",
  "Middle Eastern": "🍳",
  International: "🥗",
};

export function RecipeDiscoveryCard({
  recipe,
  rank,
  className,
}: RecipeDiscoveryCardProps) {
  const isTop = rank === 1;

  return (
    <Link href={`/recipe/${recipe.id}`} className="block">
      <motion.article
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:shadow-lg",
          isTop
            ? "border-primary/25 ring-1 ring-primary/10"
            : "border-border",
          className
        )}
      >
        {/* Image Area */}
        <div
          className={cn(
            "relative w-full bg-gradient-to-br from-amber-light to-amber/20",
            isTop ? "h-52" : "h-40"
          )}
        >
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              isTop ? "text-7xl" : "text-5xl"
            )}
          >
            {cuisineEmoji[recipe.cuisine] || "🍽️"}
          </div>

          {/* Rank Badge */}
          <div
            className={cn(
              "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-md",
              isTop
                ? "bg-primary text-primary-foreground"
                : "bg-background/90 text-foreground backdrop-blur-sm"
            )}
          >
            #{rank}
          </div>

          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "text-xs font-semibold backdrop-blur-sm",
                  tag === "Most Authentic"
                    ? "bg-green-100/90 text-green-800 border-green-200"
                    : tag === "Quickest"
                      ? "bg-blue-100/90 text-blue-800 border-blue-200"
                      : tag === "Healthiest"
                        ? "bg-emerald-100/90 text-emerald-800 border-emerald-200"
                        : "bg-background/90 text-foreground"
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rank label */}
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              isTop ? "text-primary" : "text-muted-foreground"
            )}
          >
            {rankLabels[rank - 1] || `#${rank}`}
          </span>

          <h3 className={cn("mt-1 font-heading", isTop ? "text-2xl" : "text-xl")}>
            {recipe.title}
          </h3>

          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>

          {/* Stats Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Stat icon={<Clock className="h-3.5 w-3.5" />} value={`${recipe.cookingTime} min`} />
            <Stat icon={<ChefHat className="h-3.5 w-3.5" />} value={recipe.difficulty} />
            <Stat icon={<Flame className="h-3.5 w-3.5" />} value={`${recipe.calories} cal`} />
            <Stat
              icon={<Star className="h-3.5 w-3.5 fill-amber text-amber" />}
              value={recipe.rating.toFixed(1)}
              highlight
            />
          </div>

          {/* AI Summary */}
          <div className="mt-3 rounded-xl bg-accent/60 p-3">
            <p className="text-xs leading-relaxed text-accent-foreground">
              <span className="mr-1 font-semibold text-primary">AI Insight:</span>
              {recipe.aiSummary}
            </p>
          </div>

          {/* CTA */}
          <Button
            className={cn(
              "mt-4 w-full rounded-2xl font-semibold",
              isTop ? "h-12 text-sm shadow-md" : "h-11 text-sm"
            )}
          >
            View Full Recipe
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </motion.article>
    </Link>
  );
}

function Stat({
  icon,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        highlight ? "bg-amber-light text-foreground" : "bg-muted text-muted-foreground"
      )}
    >
      {icon}
      {value}
    </span>
  );
}
