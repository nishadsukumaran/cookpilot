"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type SearchFilters,
  type FilterOption,
  CUISINE_OPTIONS,
  TIME_OPTIONS,
  DIFFICULTY_OPTIONS,
  DIETARY_OPTIONS,
} from "@/lib/search/filters";

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | null) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [filters.cuisine, filters.time, filters.difficulty, filters.dietary].filter(Boolean).length;

  return (
    <div>
      {/* Toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            expanded || hasActiveFilters
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-card text-muted-foreground border border-border hover:bg-accent"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-0.5 h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
              {activeCount}
            </Badge>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Expandable filter groups */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2.5">
              <FilterGroup
                label="Cuisine"
                options={CUISINE_OPTIONS}
                value={filters.cuisine}
                onSelect={(v) => onFilterChange("cuisine", v)}
              />
              <FilterGroup
                label="Time"
                options={TIME_OPTIONS}
                value={filters.time}
                onSelect={(v) => onFilterChange("time", v)}
              />
              <FilterGroup
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                value={filters.difficulty}
                onSelect={(v) => onFilterChange("difficulty", v)}
              />
              <FilterGroup
                label="Dietary"
                options={DIETARY_OPTIONS}
                value={filters.dietary}
                onSelect={(v) => onFilterChange("dietary", v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-16">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(value === opt.id ? null : opt.id)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              value === opt.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground border border-border hover:bg-accent hover:border-primary/20"
            )}
          >
            {opt.icon && <span className="text-xs">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
