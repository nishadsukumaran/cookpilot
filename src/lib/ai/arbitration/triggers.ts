/**
 * Validation trigger logic.
 *
 * Determines whether a primary response needs second-model
 * validation. Purely deterministic — no AI involved here.
 */

import type { StructuredAdvice } from "./types";
import type { RescueProblem } from "../../engines/types";
import { findRescueSolution } from "../../engines/rescue/rescue-db";

// ─── Trigger Rules ──────────────────────────────────

interface TriggerResult {
  shouldValidate: boolean;
  reasons: string[];
}

/**
 * Decide whether a primary response needs validation.
 */
export function shouldValidate(
  advice: StructuredAdvice,
  context: {
    scenarioType?: string;
    rescueProblem?: RescueProblem;
    hasStructuredKnowledge: boolean;
  }
): TriggerResult {
  const reasons: string[] = [];

  // Rule 1: Low self-reported confidence
  if (advice.confidence < 0.6) {
    reasons.push(`Low confidence (${(advice.confidence * 100).toFixed(0)}%)`);
  }

  // Rule 2: Vague primary fix (too short or lacks specifics)
  if (advice.primary_fix.action.length < 30) {
    reasons.push("Primary fix is vague (under 30 chars)");
  }
  if (advice.primary_fix.ingredients.length === 0 && advice.scenario_type === "rescue") {
    reasons.push("Rescue advice has no ingredient recommendations");
  }

  // Rule 3: Contradicts internal knowledge
  if (context.rescueProblem) {
    const knowledgeConflict = checkKnowledgeConflict(advice, context.rescueProblem);
    if (knowledgeConflict) {
      reasons.push(`Conflicts with knowledge base: ${knowledgeConflict}`);
    }
  }

  // Rule 4: High-impact scenario
  if (isHighImpactScenario(advice, context)) {
    reasons.push("High-impact scenario requiring validation");
  }

  // Rule 5: Authenticity-sensitive (score impact ≤ 2)
  if (advice.authenticity_impact.score <= 2) {
    reasons.push("Significant authenticity impact detected");
  }

  // Rule 6: No structured knowledge backing (AI-only response)
  if (!context.hasStructuredKnowledge && advice.confidence < 0.8) {
    reasons.push("No structured knowledge backing this advice");
  }

  return {
    shouldValidate: reasons.length > 0,
    reasons,
  };
}

/**
 * Decide whether a third arbitration model is needed.
 */
export function shouldArbitrate(
  primary: StructuredAdvice,
  validator: StructuredAdvice,
  mismatchDetected: boolean
): { shouldArbitrate: boolean; reason?: string } {
  // Material disagreement between first two
  if (mismatchDetected) {
    return {
      shouldArbitrate: true,
      reason: "Primary and validator materially disagree",
    };
  }

  // Both low confidence
  if (primary.confidence < 0.5 && validator.confidence < 0.5) {
    return {
      shouldArbitrate: true,
      reason: `Both models low confidence (${(primary.confidence * 100).toFixed(0)}%, ${(validator.confidence * 100).toFixed(0)}%)`,
    };
  }

  return { shouldArbitrate: false };
}

// ─── Internal Checks ────────────────────────────────

function checkKnowledgeConflict(
  advice: StructuredAdvice,
  problem: RescueProblem
): string | null {
  const solution = findRescueSolution(problem);
  if (!solution) return null;

  const action = advice.primary_fix.action.toLowerCase();

  // Known dangerous contradictions
  const contradictions: Record<string, string[]> = {
    "too-salty": ["add salt", "more salt", "extra salt"],
    "too-spicy": ["add chili", "more spice", "extra heat", "add pepper"],
    "too-sweet": ["add sugar", "more sugar", "extra sweetness"],
    "too-watery": ["add water", "more liquid", "thin it"],
    "too-thick": ["reduce liquid", "cook it down", "thicken further"],
    "bland": ["reduce seasoning", "less spice", "remove flavor"],
    "slightly-burned": ["keep cooking", "continue heating", "raise temperature"],
  };

  const forbidden = contradictions[problem];
  if (!forbidden) return null;

  for (const phrase of forbidden) {
    if (action.includes(phrase)) {
      return `AI suggests "${phrase}" which worsens "${problem}"`;
    }
  }

  return null;
}

function isHighImpactScenario(
  advice: StructuredAdvice,
  context: { scenarioType?: string; rescueProblem?: RescueProblem }
): boolean {
  // Burned food = high impact (can't undo)
  if (context.rescueProblem === "slightly-burned") return true;

  // Urgent rescue = high impact
  if (advice.primary_fix.urgency === "immediate") return true;

  // Multiple low impact scores = risky advice
  const lowScores = [
    advice.impact_on_taste.score,
    advice.impact_on_texture.score,
    advice.authenticity_impact.score,
  ].filter((s) => s <= 2);

  return lowScores.length >= 2;
}
