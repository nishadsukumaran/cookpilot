"use client";

import { useState } from "react";
import { Bug, ChevronDown, Clock, Database, Bot, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebugTrace, TraceStage } from "@/lib/debug/types";

interface DevTracePanelProps {
  trace: DebugTrace;
  label?: string;
  className?: string;
}

// Only render in development
const IS_DEV = process.env.NODE_ENV === "development";

export function DevTracePanel({ trace, label, className }: DevTracePanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!IS_DEV) return null;

  return (
    <div className={cn("rounded-xl border border-dashed border-violet-300/50 bg-violet-50/30", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Bug className="h-3.5 w-3.5 text-violet-500" />
        <span className="flex-1 text-[11px] font-mono font-medium text-violet-700">
          {label ?? "Trace"} · {trace.traceId}
        </span>
        <span className="text-[10px] font-mono text-violet-500">
          {trace.totalMs}ms · {trace.stages.length} stages
        </span>
        <SourceBadges source={trace.source} />
        <ChevronDown className={cn("h-3.5 w-3.5 text-violet-400 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-violet-200/50 px-3 py-2 space-y-2">
          {/* Stages */}
          {trace.stages.map((stage, i) => (
            <StageRow key={i} stage={stage} index={i} />
          ))}

          {/* Flags */}
          {trace.flags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {trace.flags.map((flag) => (
                <span
                  key={flag}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-mono text-amber-700"
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {flag}
                </span>
              ))}
            </div>
          )}

          {/* Source summary */}
          <div className="flex items-center gap-3 border-t border-violet-200/30 pt-2 text-[10px] font-mono text-violet-600">
            <span>structured: {trace.source.structured ? "✓" : "✗"}</span>
            <span>ai: {trace.source.ai ? "✓" : "✗"}</span>
            <span>mock: {trace.source.mock ? "⚠ yes" : "no"}</span>
            <span className="ml-auto">total: {trace.totalMs}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StageRow({ stage, index }: { stage: TraceStage; index: number }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-lg bg-white/60 border border-violet-100">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-200 text-[9px] font-bold text-violet-700">
          {index + 1}
        </span>
        <span className="flex-1 text-[11px] font-mono font-medium text-violet-800">
          {stage.name}
        </span>
        <span className="text-[10px] font-mono text-violet-500 truncate max-w-48">
          {stage.action}
        </span>
        <span className="text-[10px] font-mono text-violet-400 tabular-nums">
          {stage.durationMs}ms
        </span>
      </button>

      {showDetails && Object.keys(stage.details).length > 0 && (
        <div className="border-t border-violet-100 px-2.5 py-1.5">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            {Object.entries(stage.details).map(([key, value]) => (
              <div key={key} className="contents text-[10px] font-mono">
                <span className="text-violet-500">{key}:</span>
                <span className="text-violet-800 truncate">
                  {typeof value === "boolean" ? (value ? "true" : "false") : String(value ?? "null")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceBadges({ source }: { source: DebugTrace["source"] }) {
  return (
    <div className="flex gap-1">
      {source.structured && (
        <span className="flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
          <Database className="h-2.5 w-2.5" /> KB
        </span>
      )}
      {source.ai && (
        <span className={cn(
          "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
          source.mock ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
        )}>
          <Bot className="h-2.5 w-2.5" /> {source.mock ? "Mock" : "Live"}
        </span>
      )}
    </div>
  );
}

/**
 * Global dev trace toggle — wraps a page section.
 * Shows a floating button to enable/disable trace display.
 */
export function DevTraceToggle({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  if (!IS_DEV) return <>{children}</>;

  return (
    <>
      {enabled ? children : null}
      <button
        onClick={() => setEnabled(!enabled)}
        className="fixed bottom-24 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-opacity hover:opacity-90 md:bottom-4"
        aria-label={enabled ? "Hide debug traces" : "Show debug traces"}
        title={enabled ? "Hide traces" : "Show traces"}
      >
        {enabled ? <X className="h-3.5 w-3.5" /> : <Bug className="h-3.5 w-3.5" />}
      </button>
    </>
  );
}
