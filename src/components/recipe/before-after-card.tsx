"use client";

import { ArrowRight, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BeforeAfter } from "@/lib/engines/transformation/trust";

interface BeforeAfterCardProps {
  comparison: BeforeAfter;
  className?: string;
}

export function BeforeAfterCard({ comparison, className }: BeforeAfterCardProps) {
  const cal = comparison.calories;
  const saved = cal.diff > 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card", className)}>
      {/* Calorie header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground">Calories / serving</span>
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums text-muted-foreground">{cal.before}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className={cn("text-sm font-bold tabular-nums", saved ? "text-green-600" : "text-foreground")}>
            {cal.after}
          </span>
          {saved && (
            <span className="flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
              <TrendingDown className="h-2.5 w-2.5" />
              -{cal.percent}%
            </span>
          )}
        </div>
      </div>

      {/* Key changes */}
      {comparison.keyChanges.length > 0 && (
        <div className="px-4 py-2.5 space-y-1.5">
          {comparison.keyChanges.map((change) => (
            <div key={change.label} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{change.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="tabular-nums text-muted-foreground">{change.before}</span>
                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                <span className="tabular-nums font-medium">{change.after}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summaries */}
      <div className="border-t border-border/50 px-4 py-2.5 grid grid-cols-3 gap-2">
        <SummaryCell label="Taste" value={comparison.tasteSummary} />
        <SummaryCell label="Texture" value={comparison.textureSummary} />
        <SummaryCell label="Authenticity" value={comparison.authenticitySummary} />
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="mt-0.5 text-[10px] leading-tight text-foreground">{value}</p>
    </div>
  );
}
