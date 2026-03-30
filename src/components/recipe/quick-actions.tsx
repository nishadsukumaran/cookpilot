"use client";

import { Heart, Flame, Minus as MinusIcon, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const actions: QuickAction[] = [
  { id: "keep-authentic", label: "Keep Authentic", icon: <ShieldCheck className="h-4 w-4" />, color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" },
  { id: "make-healthier", label: "Healthier", icon: <Heart className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { id: "reduce-spice", label: "Less Spice", icon: <Flame className="h-4 w-4" />, color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { id: "reduce-calories", label: "Fewer Cal", icon: <MinusIcon className="h-4 w-4" />, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
];

interface QuickActionsProps {
  activeId?: string;
  onAction: (actionId: string) => void;
  className?: string;
}

export function QuickActions({ activeId, onAction, className }: QuickActionsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto hide-scrollbar", className)}>
      {actions.map((action) => {
        const isActive = activeId === action.id;
        return (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
              isActive
                ? "ring-2 ring-primary/30 " + action.color
                : action.color
            )}
          >
            {action.icon}
            {action.label}
          </motion.button>
        );
      })}
    </div>
  );
}
