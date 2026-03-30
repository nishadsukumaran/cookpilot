/**
 * Semantic mismatch detection.
 *
 * Compares two StructuredAdvice responses to determine if they
 * MATERIALLY disagree. Different wording with the same semantic
 * meaning is NOT a mismatch.
 *
 * Comparison happens on structured fields only:
 * - Action direction (add vs. remove, increase vs. decrease)
 * - Impact directions (better/worse/neutral)
 * - Confidence divergence
 * - Ingredient contradiction (recommending opposite things)
 */

import type { StructuredAdvice } from "./types";

export interface MismatchResult {
  hasMaterialMismatch: boolean;
  mismatches: MismatchDetail[];
  agreementScore: number; // 0-100, higher = more agreement
}

export interface MismatchDetail {
  field: string;
  primary: string;
  validator: string;
  severity: "minor" | "major" | "critical";
  explanation: string;
}

/**
 * Compare two structured responses for material disagreement.
 */
export function detectMismatch(
  primary: StructuredAdvice,
  validator: StructuredAdvice
): MismatchResult {
  const mismatches: MismatchDetail[] = [];

  // 1. Compare action direction
  const actionMismatch = compareActions(primary.primary_fix.action, validator.primary_fix.action);
  if (actionMismatch) mismatches.push(actionMismatch);

  // 2. Compare impact directions
  const tasteMismatch = compareImpactDirections(
    "impact_on_taste",
    primary.impact_on_taste.direction,
    validator.impact_on_taste.direction
  );
  if (tasteMismatch) mismatches.push(tasteMismatch);

  const textureMismatch = compareImpactDirections(
    "impact_on_texture",
    primary.impact_on_texture.direction,
    validator.impact_on_texture.direction
  );
  if (textureMismatch) mismatches.push(textureMismatch);

  const authMismatch = compareImpactDirections(
    "authenticity_impact",
    primary.authenticity_impact.direction,
    validator.authenticity_impact.direction
  );
  if (authMismatch) mismatches.push(authMismatch);

  // 3. Compare impact scores (major = >2 points apart)
  const scoreMismatches = compareScores(primary, validator);
  mismatches.push(...scoreMismatches);

  // 4. Compare ingredient recommendations
  const ingredientMismatch = compareIngredients(
    primary.primary_fix.ingredients,
    validator.primary_fix.ingredients
  );
  if (ingredientMismatch) mismatches.push(ingredientMismatch);

  // 5. Confidence divergence
  const confDiff = Math.abs(primary.confidence - validator.confidence);
  if (confDiff > 0.4) {
    mismatches.push({
      field: "confidence",
      primary: `${(primary.confidence * 100).toFixed(0)}%`,
      validator: `${(validator.confidence * 100).toFixed(0)}%`,
      severity: "minor",
      explanation: `Large confidence gap (${(confDiff * 100).toFixed(0)}pp)`,
    });
  }

  // Calculate agreement score
  const criticalCount = mismatches.filter((m) => m.severity === "critical").length;
  const majorCount = mismatches.filter((m) => m.severity === "major").length;
  const minorCount = mismatches.filter((m) => m.severity === "minor").length;

  const penaltyScore = criticalCount * 30 + majorCount * 15 + minorCount * 5;
  const agreementScore = Math.max(0, 100 - penaltyScore);

  // Material mismatch = any critical, or 2+ major
  const hasMaterialMismatch =
    criticalCount > 0 || majorCount >= 2;

  return { hasMaterialMismatch, mismatches, agreementScore };
}

// ─── Comparison Helpers ─────────────────────────────

/** Semantic opposites — these constitute material action disagreement */
const ACTION_OPPOSITES: Array<[RegExp, RegExp]> = [
  [/\badd\b/i, /\bremov|reduc|avoid/i],
  [/\bincreas/i, /\bdecreas|reduc|lower/i],
  [/\bheat|cook\s+more/i, /\bcool|stop\s+cook|remov.*heat/i],
  [/\bdilut|thin/i, /\bthick|reduc.*liquid|evaporat/i],
  [/\bmore\s+(salt|sugar|spice)/i, /\bless\s+(salt|sugar|spice)/i],
];

function compareActions(
  primaryAction: string,
  validatorAction: string
): MismatchDetail | null {
  for (const [patternA, patternB] of ACTION_OPPOSITES) {
    const primaryMatchesA = patternA.test(primaryAction);
    const primaryMatchesB = patternB.test(primaryAction);
    const validatorMatchesA = patternA.test(validatorAction);
    const validatorMatchesB = patternB.test(validatorAction);

    // One matches pattern A, other matches opposite pattern B
    if (
      (primaryMatchesA && validatorMatchesB) ||
      (primaryMatchesB && validatorMatchesA)
    ) {
      return {
        field: "primary_fix.action",
        primary: primaryAction.slice(0, 80),
        validator: validatorAction.slice(0, 80),
        severity: "critical",
        explanation: "Recommended actions are contradictory",
      };
    }
  }
  return null;
}

function compareImpactDirections(
  field: string,
  primary: string,
  validator: string
): MismatchDetail | null {
  // Opposite directions = major mismatch
  const opposites: Record<string, string> = {
    better: "worse",
    worse: "better",
  };

  if (opposites[primary] === validator) {
    return {
      field,
      primary,
      validator,
      severity: "major",
      explanation: `Opposite impact predictions (${primary} vs ${validator})`,
    };
  }
  return null;
}

function compareScores(
  primary: StructuredAdvice,
  validator: StructuredAdvice
): MismatchDetail[] {
  const results: MismatchDetail[] = [];
  const pairs: Array<[string, number, number]> = [
    ["impact_on_taste", primary.impact_on_taste.score, validator.impact_on_taste.score],
    ["impact_on_texture", primary.impact_on_texture.score, validator.impact_on_texture.score],
    ["authenticity_impact", primary.authenticity_impact.score, validator.authenticity_impact.score],
  ];

  for (const [field, pScore, vScore] of pairs) {
    const diff = Math.abs(pScore - vScore);
    if (diff > 2) {
      results.push({
        field: `${field}.score`,
        primary: pScore.toString(),
        validator: vScore.toString(),
        severity: "major",
        explanation: `Score divergence of ${diff} points (${pScore} vs ${vScore})`,
      });
    }
  }

  return results;
}

function compareIngredients(
  primaryIngs: Array<{ name: string; amount: string }>,
  validatorIngs: Array<{ name: string; amount: string }>
): MismatchDetail | null {
  const primaryNames = new Set(primaryIngs.map((i) => i.name.toLowerCase()));
  const validatorNames = new Set(validatorIngs.map((i) => i.name.toLowerCase()));

  // Check if one recommends an ingredient the other specifically avoids
  // (Simple: check for zero overlap when both have recommendations)
  if (primaryNames.size > 0 && validatorNames.size > 0) {
    const overlap = [...primaryNames].filter((n) => validatorNames.has(n));
    if (overlap.length === 0 && primaryNames.size >= 2 && validatorNames.size >= 2) {
      return {
        field: "primary_fix.ingredients",
        primary: [...primaryNames].join(", "),
        validator: [...validatorNames].join(", "),
        severity: "major",
        explanation: "Completely different ingredient recommendations",
      };
    }
  }

  return null;
}
