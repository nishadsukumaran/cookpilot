import { ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthenticityBadgeProps {
  level: "authentic" | "adapted" | "modified";
  className?: string;
}

const config = {
  authentic: {
    label: "Authentic Recipe",
    icon: ShieldCheck,
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    iconColor: "text-green-600",
  },
  adapted: {
    label: "Slightly Adapted",
    icon: ShieldCheck,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-600",
  },
  modified: {
    label: "Modified Recipe",
    icon: AlertTriangle,
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    iconColor: "text-orange-600",
  },
};

export function AuthenticityBadge({
  level,
  className,
}: AuthenticityBadgeProps) {
  const { label, icon: Icon, bg, text, iconColor } = config[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        bg,
        text,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      {label}
    </span>
  );
}
