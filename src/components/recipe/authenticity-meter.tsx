"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthenticityMeterProps {
  score: number; // 0-100
  label: string;
  className?: string;
}

export function AuthenticityMeter({ score, label, className }: AuthenticityMeterProps) {
  const color =
    score >= 90 ? "text-green-600"
    : score >= 70 ? "text-amber-600"
    : score >= 50 ? "text-orange-600"
    : "text-red-600";

  const ringColor =
    score >= 90 ? "stroke-green-500"
    : score >= 70 ? "stroke-amber-500"
    : score >= 50 ? "stroke-orange-500"
    : "stroke-red-500";

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Circular meter */}
      <div className="relative h-16 w-16 shrink-0">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/50" />
          <circle
            cx="40" cy="40" r="36" fill="none" strokeWidth="5" strokeLinecap="round"
            className={ringColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-sm font-bold tabular-nums", color)}>{score}%</span>
        </div>
      </div>
      {/* Label */}
      <div>
        <div className="flex items-center gap-1">
          <ShieldCheck className={cn("h-3.5 w-3.5", color)} />
          <span className="text-xs font-semibold">{label}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Signature preservation</p>
      </div>
    </div>
  );
}
