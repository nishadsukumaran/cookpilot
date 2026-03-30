/**
 * Feedback aggregation — queries feedback data and computes
 * per-scenario metrics for confidence adjustment.
 *
 * Uses direct SQL queries via Neon for aggregation.
 * Falls back to empty metrics when DB is unavailable.
 */

import type { FeedbackAggregation, ScenarioMetrics } from "./types";

// ─── In-Memory Cache ────────────────────────────────
// Avoid hitting the DB on every request. TTL: 5 minutes.

let cachedAggregations: Map<string, FeedbackAggregation> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get feedback aggregation for a specific target type.
 * Returns cached data when available; fetches from DB otherwise.
 */
export async function getFeedbackAggregation(
  targetType: string
): Promise<FeedbackAggregation> {
  if (cachedAggregations && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedAggregations.get(targetType) ?? emptyAggregation(targetType);
  }

  try {
    await refreshCache();
    return cachedAggregations?.get(targetType) ?? emptyAggregation(targetType);
  } catch {
    return emptyAggregation(targetType);
  }
}

/**
 * Get all feedback aggregations (for analytics panel).
 */
export async function getAllFeedbackAggregations(): Promise<FeedbackAggregation[]> {
  if (cachedAggregations && Date.now() - cacheTimestamp < CACHE_TTL) {
    return [...cachedAggregations.values()];
  }

  try {
    await refreshCache();
    return [...(cachedAggregations?.values() ?? [])];
  } catch {
    return [];
  }
}

/**
 * Compute the confidence modifier from feedback data.
 *
 * Positive feedback boosts confidence, negative drags it down.
 * Only applies when there's sufficient feedback (>= 3 responses).
 */
export function feedbackConfidenceModifier(agg: FeedbackAggregation): number {
  if (agg.totalCount < 3) return 0; // insufficient data

  // +3 for high helpful rate, -8 for high negative rate
  let modifier = 0;

  if (agg.helpfulRate >= 0.8) modifier += 3;
  else if (agg.helpfulRate >= 0.6) modifier += 1;

  if (agg.negativeRate >= 0.4) modifier -= 8;
  else if (agg.negativeRate >= 0.2) modifier -= 3;

  if (agg.tooRiskyCount > agg.totalCount * 0.3) modifier -= 5;

  return modifier;
}

// ─── Cache Management ───────────────────────────────

async function refreshCache(): Promise<void> {
  // Dynamic import to avoid requiring DB at module load time
  const { getDb } = await import("../../db/index");
  const { userFeedback } = await import("../../db/schema");
  const { sql: sqlFn } = await import("drizzle-orm");

  const db = getDb();
  const rows = await db
    .select({
      targetType: userFeedback.targetType,
      rating: userFeedback.rating,
    })
    .from(userFeedback);

  const map = new Map<string, FeedbackAggregation>();

  for (const row of rows) {
    const existing = map.get(row.targetType) ?? emptyAggregation(row.targetType);
    existing.totalCount++;

    switch (row.rating) {
      case "helpful": existing.helpfulCount++; break;
      case "not_helpful": existing.notHelpfulCount++; break;
      case "too_risky": existing.tooRiskyCount++; break;
      case "too_different": existing.tooDifferentCount++; break;
    }

    existing.helpfulRate = existing.helpfulCount / existing.totalCount;
    existing.negativeRate =
      (existing.notHelpfulCount + existing.tooRiskyCount + existing.tooDifferentCount) /
      existing.totalCount;

    map.set(row.targetType, existing);
  }

  cachedAggregations = map;
  cacheTimestamp = Date.now();
}

function emptyAggregation(targetType: string): FeedbackAggregation {
  return {
    targetType,
    totalCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    tooRiskyCount: 0,
    tooDifferentCount: 0,
    helpfulRate: 0,
    negativeRate: 0,
  };
}

// ─── Analytics Queries ──────────────────────────────

/**
 * Get top rescue scenarios by usage (for analytics panel).
 */
export async function getScenarioMetrics(): Promise<ScenarioMetrics[]> {
  try {
    const { getDb } = await import("../../db/index");
    const { rescueQueries, aiInteractions } = await import("../../db/schema");
    const { sql: sqlFn, desc } = await import("drizzle-orm");

    const db = getDb();

    // Rescue scenario counts
    const rescueRows = await db
      .select({
        problemType: rescueQueries.problemType,
      })
      .from(rescueQueries);

    const scenarioCounts = new Map<string, number>();
    for (const row of rescueRows) {
      const key = row.problemType ?? "unknown";
      scenarioCounts.set(key, (scenarioCounts.get(key) ?? 0) + 1);
    }

    // AI latency stats
    const aiRows = await db
      .select({
        taskType: aiInteractions.taskType,
        latencyMs: aiInteractions.latencyMs,
      })
      .from(aiInteractions);

    const latencyByTask = new Map<string, number[]>();
    for (const row of aiRows) {
      const list = latencyByTask.get(row.taskType) ?? [];
      if (row.latencyMs) list.push(row.latencyMs);
      latencyByTask.set(row.taskType, list);
    }

    const metrics: ScenarioMetrics[] = [];
    for (const [scenario, count] of scenarioCounts) {
      const latencies = latencyByTask.get("rescue-advice") ?? [];
      const avgLatency = latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;

      metrics.push({
        scenario,
        feedbackCount: count,
        helpfulRate: 0, // would need join with feedback — simplified for now
        avgAiLatency: avgLatency,
        avgConfidence: 0,
      });
    }

    return metrics.sort((a, b) => b.feedbackCount - a.feedbackCount);
  } catch {
    return [];
  }
}
