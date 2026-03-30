"use client";

import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceRiskBadgeProps {
  confidence: { score: number; label: string };
  risk: { level: "low" | "medium" | "high"; reasons: string[] };
  className?: string;
}

const riskConfig = {
  low: { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Low Risk" },
  medium: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Medium Risk" },
  high: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "High Risk" },
};

export function ConfidenceRiskBadge({ confidence, risk, className }: ConfidenceRiskBadgeProps) {
  const config = riskConfig[risk.level];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-2xl border p-3", config.bg, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
        </div>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold tabular-nums">
          {confidence.score}% confident
        </span>
      </div>
      {risk.reasons[0] && risk.level !== "low" && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{risk.reasons[0]}</p>
      )}
    </div>
  );
}
