/**
 * Dynamic confidence adjustment layer.
 *
 * Wraps the base confidence score from computeTrustMetrics
 * with feedback-based and preference-based modifiers.
 * Does NOT change the core deterministic logic.
 */

import type { ConfidenceAdjustment, PersonalizationBias } from "./types";
import { getFeedbackAggregation, feedbackConfidenceModifier } from "./feedback";

/**
 * Adjust a base confidence score using feedback history and user preferences.
 *
 * @param baseScore - The deterministic confidence score (0-99) from computeTrustMetrics
 * @param targetType - "rescue" | "substitution" | "modification"
 * @param preferences - Optional user preferences for personalization bias
 */
export async function adjustConfidence(
  baseScore: number,
  targetType: string,
  preferences?: PersonalizationBias | null
): Promise<ConfidenceAdjustment> {
  const reasons: string[] = [];
  let feedbackMod = 0;
  let prefMod = 0;

  // ─── Feedback-based adjustment ────────────────────
  try {
    const agg = await getFeedbackAggregation(targetType);
    feedbackMod = feedbackConfidenceModifier(agg);

    if (feedbackMod !== 0) {
      reasons.push(
        feedbackMod > 0
          ? `+${feedbackMod} from ${agg.helpfulRate * 100 | 0}% helpful rate (${agg.totalCount} responses)`
          : `${feedbackMod} from ${agg.negativeRate * 100 | 0}% negative rate (${agg.totalCount} responses)`
      );
    }
  } catch {
    // DB unavailable — no adjustment
  }

  // ─── Preference-based adjustment ──────────────────
  if (preferences) {
    // Strict authenticity users get lower confidence on adapted recipes
    if (preferences.authenticityStrictness > 1.0 && targetType === "modification") {
      prefMod -= 3;
      reasons.push("-3 from strict authenticity preference");
    }

    // Adventurous users get slightly higher confidence on modifications
    if (preferences.authenticityStrictness < 0.9 && targetType === "modification") {
      prefMod += 2;
      reasons.push("+2 from adventurous authenticity preference");
    }
  }

  const adjustedScore = Math.max(10, Math.min(99, baseScore + feedbackMod + prefMod));

  return {
    baseScore,
    feedbackModifier: feedbackMod,
    preferenceModifier: prefMod,
    adjustedScore,
    reasons: reasons.length > 0 ? reasons : ["No adjustments — using base score"],
  };
}
