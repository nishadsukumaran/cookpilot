"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChefHat,
  Clock,
  Flame,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  PrimaryRecipe,
  AlternativeRecipe,
  ExpandedData,
} from "@/hooks/use-recipe-discovery";

interface DiscoveryResultCardProps {
  intent: string | null;
  primary: PrimaryRecipe | null;
  alternatives: AlternativeRecipe[];
  followups: string[];
  expandedAlternatives: Map<number, ExpandedData>;
  expandingIndex: number | null;
  onExpandAlternative: (index: number) => void;
  onImportPrimary: () => void;
  onImportAlternative: (index: number) => void;
  onFollowup: (text: string) => void;
  className?: string;
}

export function DiscoveryResultCard({
  intent,
  primary,
  alternatives,
  followups,
  expandedAlternatives,
  expandingIndex,
  onExpandAlternative,
  onImportPrimary,
  onImportAlternative,
  onFollowup,
  className,
}: DiscoveryResultCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (!primary) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Intent banner */}
      {intent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-purple-500/8 border border-purple-500/15 px-3.5 py-2.5"
        >
          <ChefHat className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <p className="text-xs text-foreground">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Chef's understanding: </span>
            {intent}
          </p>
        </motion.div>
      )}

      {/* Primary recipe — Chef's Pick */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-primary/20 bg-card shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Chef's Pick</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-heading text-lg font-semibold">{primary.title}</h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{primary.cuisine}</Badge>
            <Badge variant="outline" className={cn(
              "text-[10px] px-1.5 py-0",
              primary.difficulty === "Easy" && "border-green-500/30 text-green-700 dark:text-green-400",
              primary.difficulty === "Medium" && "border-amber-500/30 text-amber-700 dark:text-amber-400",
              primary.difficulty === "Hard" && "border-red-500/30 text-red-700 dark:text-red-400",
            )}>{primary.difficulty}</Badge>
            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0">
              <Globe className="mr-0.5 h-2.5 w-2.5" />AI Generated
            </Badge>
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{primary.description}</p>

          {/* Why this matches */}
          {primary.why_match && (
            <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2.5">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold text-primary">Why this recipe: </span>
                {primary.why_match}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatPill icon={<Clock className="h-3 w-3" />} value={`${primary.prepTime + primary.cookingTime} min`} />
            <StatPill icon={<Users className="h-3 w-3" />} value={`${primary.servings} servings`} />
            <StatPill icon={<Flame className="h-3 w-3" />} value={`${primary.calories} cal`} />
          </div>

          {/* Tags */}
          {primary.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {primary.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Import button */}
          <Button
            onClick={onImportPrimary}
            className="mt-4 w-full h-11 rounded-2xl font-semibold"
          >
            Preview & Import
          </Button>
        </div>
      </motion.div>

      {/* Alternatives section */}
      {alternatives.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Other approaches</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{alternatives.length}</Badge>
            </div>
            {showAlternatives ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showAlternatives && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {alternatives.map((alt, idx) => (
                  <AlternativeCard
                    key={alt.id}
                    alt={alt}
                    index={idx}
                    expanded={expandedAlternatives.get(idx)}
                    expanding={expandingIndex === idx}
                    onExpand={() => onExpandAlternative(idx)}
                    onImport={() => onImportAlternative(idx)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Followup suggestions */}
      {followups.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {followups.map((f) => (
            <button
              key={f}
              onClick={() => onFollowup(f)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:border-primary/20"
            >
              {f}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function AlternativeCard({
  alt,
  index,
  expanded,
  expanding,
  onExpand,
  onImport,
}: {
  alt: AlternativeRecipe;
  index: number;
  expanded?: ExpandedData;
  expanding: boolean;
  onExpand: () => void;
  onImport: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">{alt.title}</h4>
          <p className="mt-0.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">{alt.difference}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{alt.cuisine}</Badge>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{alt.description}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatPill icon={<Clock className="h-3 w-3" />} value={`${alt.cookingTime} min`} />
        <StatPill icon={<Flame className="h-3 w-3" />} value={`${alt.calories} cal`} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 border-t border-border pt-3 space-y-2"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {expanded.ingredients.length} ingredients, {expanded.steps.length} steps
          </p>
          <Button onClick={onImport} size="sm" className="w-full h-9 rounded-xl text-xs font-semibold">
            Preview & Import
          </Button>
        </motion.div>
      )}

      {/* Expand / loading button */}
      {!expanded && (
        <button
          onClick={onExpand}
          disabled={expanding}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {expanding ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Expanding...</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Show full recipe</>
          )}
        </button>
      )}
    </div>
  );
}

function StatPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {icon}
      {value}
    </span>
  );
}
