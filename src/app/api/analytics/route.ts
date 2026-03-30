import { NextResponse } from "next/server";
import {
  getAllFeedbackAggregations,
  getScenarioMetrics,
} from "@/lib/engines/learning";

/**
 * Dev-only analytics endpoint.
 * Returns feedback aggregation, scenario metrics, and AI performance stats.
 */
export async function GET() {
  try {
    const [feedbackAggs, scenarioMetrics] = await Promise.all([
      getAllFeedbackAggregations(),
      getScenarioMetrics(),
    ]);

    // AI latency from scenario metrics
    const aiLatencies = scenarioMetrics
      .filter((m) => m.avgAiLatency > 0)
      .map((m) => m.avgAiLatency);
    const avgLatency = aiLatencies.length > 0
      ? Math.round(aiLatencies.reduce((a, b) => a + b, 0) / aiLatencies.length)
      : 0;

    return NextResponse.json({
      feedback: feedbackAggs,
      scenarios: scenarioMetrics,
      performance: {
        avgAiLatencyMs: avgLatency,
        totalScenarios: scenarioMetrics.length,
        totalFeedback: feedbackAggs.reduce((sum, a) => sum + a.totalCount, 0),
      },
    });
  } catch (err) {
    return NextResponse.json({
      feedback: [],
      scenarios: [],
      performance: { avgAiLatencyMs: 0, totalScenarios: 0, totalFeedback: 0 },
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
