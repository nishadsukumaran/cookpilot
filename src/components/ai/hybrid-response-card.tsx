"use client";

import {
  Zap,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  ShieldCheck,
  Bot,
  Database,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HybridResponse, ImpactDimension } from "@/lib/hybrid/types";

interface HybridResponseCardProps {
  response: HybridResponse;
  className?: string;
}

export function HybridResponseCard({
  response,
  className,
}: HybridResponseCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Primary Fix */}
      <div
        className={cn(
          "rounded-2xl border p-4",
          response.fix.urgency === "immediate"
            ? "border-red-200 bg-red-50"
            : "border-border bg-card"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              response.fix.urgency === "immediate"
                ? "bg-red-100"
                : "bg-amber-light"
            )}
          >
            <Zap
              className={cn(
                "h-4.5 w-4.5",
                response.fix.urgency === "immediate"
                  ? "text-red-600"
                  : "text-primary"
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{response.fix.title}</h4>
              {response.fix.urgency === "immediate" && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Act Now
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {response.fix.instruction}
            </p>
            {response.fix.ingredients && response.fix.ingredients.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {response.fix.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    {ing.name}: {ing.amount}
                  </span>
                ))}
              </div>
            )}
            {response.fix.duration && (
              <span className="mt-2 inline-block text-xs text-muted-foreground">
                ⏱ {response.fix.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {response.alternatives.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex w-full items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {response.alternatives.length} Alternative{response.alternatives.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showAlternatives && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {showAlternatives && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 px-4 pb-4">
                  {response.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-xl bg-muted/50 p-3">
                      <h5 className="text-xs font-semibold">{alt.title}</h5>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {alt.instruction}
                      </p>
                      {alt.ingredients && alt.ingredients.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {alt.ingredients.map((ing, j) => (
                            <span
                              key={j}
                              className="text-[10px] rounded-full bg-background px-2 py-0.5 font-medium"
                            >
                              {ing.name}: {ing.amount}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-1.5 text-[11px] italic text-muted-foreground">
                        {alt.tradeoff}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Impact Summary */}
      {response.type !== "general" && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Impact Analysis
          </h4>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <ImpactCell label="Taste" dimension={response.impact.taste} />
            <ImpactCell label="Texture" dimension={response.impact.texture} />
            <ImpactCell label="Authenticity" dimension={response.impact.authenticity} />
          </div>
        </div>
      )}

      {/* Why this recommendation? */}
      {response.explanation && response.type !== "general" && (
        <WhySection explanation={response.explanation} />
      )}

      {/* Pro Tip */}
      {response.proTip && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">Pro tip:</span> {response.proTip}
          </p>
        </div>
      )}

      {/* Arbitration Metadata */}
      {response.arbitration && response.arbitration.tiersUsed > 1 && (
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span>
              Verified by {response.arbitration.tiersUsed} AI model{response.arbitration.tiersUsed !== 1 ? "s" : ""}
            </span>
          </div>
          {response.arbitration.validationReasons.length > 0 && (
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Validation triggered: {response.arbitration.validationReasons.join(", ")}
            </p>
          )}
          {response.arbitration.guardrailApplied && (
            <p className="mt-1 text-[10px] text-amber-600">
              Safety guardrail applied: {response.arbitration.guardrailCorrections.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Source Indicator */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        {response.source.structured && (
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Knowledge Base
          </span>
        )}
        {response.source.ai && (
          <span className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            {response.arbitration?.tiersUsed
              ? `${response.arbitration.tiersUsed}-Model Validated`
              : "AI Enhanced"}
          </span>
        )}
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          {response.source.confidence} confidence
        </span>
      </div>
    </div>
  );
}

function ImpactCell({
  label,
  dimension,
}: {
  label: string;
  dimension: ImpactDimension;
}) {
  const config = {
    better: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    worse: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
    neutral: { icon: Minus, color: "text-gray-500", bg: "bg-gray-50" },
    different: { icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-50" },
  };

  const { icon: Icon, color, bg } = config[dimension.direction];

  return (
    <div className={cn("flex flex-col items-center gap-1.5 rounded-xl p-2.5", bg)}>
      <Icon className={cn("h-4 w-4", color)} />
      <span className="text-[11px] font-semibold">{label}</span>
      <span className="text-center text-[10px] text-muted-foreground leading-tight">
        {dimension.description || dimension.direction}
      </span>
    </div>
  );
}

function WhySection({ explanation }: { explanation: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border/50 bg-accent/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        <Bot className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1 text-xs font-medium text-primary">
          Why this recommendation?
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-3 text-xs leading-relaxed text-accent-foreground">
              {explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
