"use client";

import { Lightbulb, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CookingStep } from "@/data/mock-data";

interface StepCardProps {
  step: CookingStep;
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function StepCard({
  step,
  isActive = false,
  isCompleted = false,
  className,
}: StepCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        isActive
          ? "border-primary bg-card shadow-md ring-1 ring-primary/20"
          : isCompleted
            ? "border-border/50 bg-muted/30 opacity-70"
            : "border-border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            isActive
              ? "bg-primary text-primary-foreground"
              : isCompleted
                ? "bg-muted text-muted-foreground line-through"
                : "bg-muted text-muted-foreground"
          )}
        >
          {isCompleted ? "✓" : step.number}
        </div>
        <div className="flex-1">
          <p
            className={cn(
              "text-sm leading-relaxed",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {step.instruction}
          </p>
          {step.duration && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {step.duration} min
            </span>
          )}
          {step.tip && (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-light/50 p-2.5 text-xs">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-accent-foreground">{step.tip}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
