"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CategoryChipProps {
  label: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryChip({
  label,
  icon,
  isActive = false,
  onClick,
}: CategoryChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-card text-foreground border border-border hover:bg-accent"
      )}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}
