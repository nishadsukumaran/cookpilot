"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, ThumbsUp, ThumbsDown, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const IS_DEV = process.env.NODE_ENV === "development";

interface AnalyticsData {
  feedback: Array<{
    targetType: string;
    totalCount: number;
    helpfulCount: number;
    notHelpfulCount: number;
    tooRiskyCount: number;
    tooDifferentCount: number;
    helpfulRate: number;
    negativeRate: number;
  }>;
  scenarios: Array<{
    scenario: string;
    feedbackCount: number;
    avgAiLatency: number;
  }>;
  performance: {
    avgAiLatencyMs: number;
    totalScenarios: number;
    totalFeedback: number;
  };
}

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!IS_DEV) return null;

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); fetchData(); }}
        className="fixed bottom-24 right-26 z-50 flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-3 text-white shadow-lg hover:opacity-90 md:bottom-4"
        title="Dev Analytics"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">Analytics</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white shadow-2xl md:rounded-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">System Analytics</h2>
              <button onClick={fetchData} className="rounded-full p-1.5 hover:bg-gray-100" title="Refresh">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Performance Summary */}
              {data && (
                <div className="grid grid-cols-3 gap-2">
                  <MetricCard label="Avg AI Latency" value={`${data.performance.avgAiLatencyMs}ms`} icon={<Clock className="h-3.5 w-3.5" />} />
                  <MetricCard label="Total Scenarios" value={String(data.performance.totalScenarios)} icon={<BarChart3 className="h-3.5 w-3.5" />} />
                  <MetricCard label="Total Feedback" value={String(data.performance.totalFeedback)} icon={<ThumbsUp className="h-3.5 w-3.5" />} />
                </div>
              )}

              {/* Feedback by Type */}
              {data && data.feedback.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Feedback by Type</h3>
                  <div className="space-y-2">
                    {data.feedback.map((f) => (
                      <div key={f.targetType} className="rounded-xl border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold capitalize">{f.targetType}</span>
                          <span className="text-[10px] text-gray-400">{f.totalCount} responses</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <FeedbackBar label="Helpful" count={f.helpfulCount} total={f.totalCount} color="bg-green-500" />
                          <FeedbackBar label="Not helpful" count={f.notHelpfulCount} total={f.totalCount} color="bg-red-500" />
                          <FeedbackBar label="Too risky" count={f.tooRiskyCount} total={f.totalCount} color="bg-amber-500" />
                          <FeedbackBar label="Too different" count={f.tooDifferentCount} total={f.totalCount} color="bg-orange-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Scenarios */}
              {data && data.scenarios.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Rescue Scenarios</h3>
                  <div className="space-y-1">
                    {data.scenarios.slice(0, 8).map((s) => (
                      <div key={s.scenario} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-[11px] font-medium">{s.scenario}</span>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span>{s.feedbackCount} queries</span>
                          {s.avgAiLatency > 0 && <span>{s.avgAiLatency}ms avg</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {data && data.feedback.length === 0 && data.scenarios.length === 0 && (
                <p className="py-8 text-center text-xs text-gray-400">
                  No analytics data yet. Use the app to generate feedback and AI interactions.
                </p>
              )}

              {!data && !loading && (
                <p className="py-8 text-center text-xs text-gray-400">Click refresh to load analytics.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 p-3">
      <span className="text-gray-400">{icon}</span>
      <span className="mt-1 text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}

function FeedbackBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex-1">
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="mt-0.5 block text-center text-[9px] text-gray-400">{count} {label.toLowerCase()}</span>
    </div>
  );
}
