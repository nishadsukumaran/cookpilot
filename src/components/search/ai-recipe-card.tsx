"use client";

import { Clock, Flame, Users, Globe, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { AiCandidate } from "@/hooks/use-recipe-search";

interface AiRecipeCardProps {
  candidate: AiCandidate;
  onClick: () => void;
  className?: string;
}

export function AiRecipeCard({ candidate, onClick, className }: AiRecipeCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover hover:border-purple-500/20",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-semibold leading-tight truncate">
            {candidate.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {candidate.cuisine}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                candidate.difficulty === "Easy" && "border-green-500/30 text-green-700 dark:text-green-400",
                candidate.difficulty === "Medium" && "border-amber-500/30 text-amber-700 dark:text-amber-400",
                candidate.difficulty === "Hard" && "border-red-500/30 text-red-700 dark:text-red-400",
              )}
            >
              {candidate.difficulty}
            </Badge>
            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0">
              <Globe className="mr-0.5 h-2.5 w-2.5" />
              AI Generated
            </Badge>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {candidate.description}
      </p>

      {/* Stats */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Stat icon={<Clock className="h-3 w-3" />} value={`${candidate.prepTime + candidate.cookingTime} min`} />
        <Stat icon={<Users className="h-3 w-3" />} value={`${candidate.servings} servings`} />
        <Stat icon={<Flame className="h-3 w-3" />} value={`${candidate.calories} cal`} />
      </div>

      {/* Tags */}
      {candidate.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {candidate.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-purple-500/5 px-3.5 py-2.5 transition-colors group-hover:bg-purple-500/10">
        <span className="text-sm font-semibold text-foreground">Preview & Import</span>
        <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {icon}
      {value}
    </span>
  );
}
