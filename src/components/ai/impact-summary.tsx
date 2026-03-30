import { TrendingDown, TrendingUp, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImpactItem {
  label: string;
  direction: "increase" | "decrease" | "neutral" | "warning";
  description: string;
}

interface ImpactSummaryProps {
  title: string;
  impacts: ImpactItem[];
  className?: string;
}

const directionConfig = {
  increase: {
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  decrease: {
    icon: TrendingDown,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
};

export function ImpactSummary({
  title,
  impacts,
  className,
}: ImpactSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        className
      )}
    >
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="mt-3 space-y-2.5">
        {impacts.map((impact, i) => {
          const { icon: Icon, color, bg } = directionConfig[impact.direction];
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  bg
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", color)} />
              </div>
              <div>
                <span className="text-xs font-medium">{impact.label}</span>
                <p className="text-xs text-muted-foreground">
                  {impact.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
