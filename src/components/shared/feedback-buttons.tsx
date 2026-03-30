"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackButtonsProps {
  targetType: "rescue" | "substitution" | "modification";
  targetId?: string;
  className?: string;
}

const options = [
  { id: "helpful", icon: ThumbsUp, label: "Helpful", color: "hover:bg-green-50 hover:text-green-600" },
  { id: "not_helpful", icon: ThumbsDown, label: "Not helpful", color: "hover:bg-red-50 hover:text-red-600" },
  { id: "too_risky", icon: AlertTriangle, label: "Too risky", color: "hover:bg-amber-50 hover:text-amber-600" },
  { id: "too_different", icon: ArrowRightLeft, label: "Too different", color: "hover:bg-orange-50 hover:text-orange-600" },
] as const;

export function FeedbackButtons({ targetType, targetId, className }: FeedbackButtonsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleFeedback(rating: string) {
    setSelected(rating);
    setSubmitted(true);

    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, rating }),
    }).catch(() => {});
  }

  if (submitted) {
    return (
      <div className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground", className)}>
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="mr-1 text-[10px] text-muted-foreground">Was this helpful?</span>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => handleFeedback(opt.id)}
          title={opt.label}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
            opt.color,
            selected === opt.id && "ring-2 ring-primary/30"
          )}
        >
          <opt.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
