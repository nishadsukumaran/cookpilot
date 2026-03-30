"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AiSuggestionCardProps {
  title: string;
  description: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export function AiSuggestionCard({
  title,
  description,
  icon,
  onClick,
  className,
}: AiSuggestionCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-light text-lg">
        {icon || <Sparkles className="h-5 w-5 text-primary" />}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
