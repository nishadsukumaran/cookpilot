/**
 * Substitution impact analyzer.
 *
 * Computes aggregate impact scores and generates
 * human-readable summaries for substitution decisions.
 */

import type { SubstituteOption, SubstitutionImpact } from "../types";

/**
 * Calculate an overall compatibility score (0-100) for a substitute.
 * Weights: taste 40%, texture 25%, authenticity 35%
 */
export function overallScore(impact: SubstitutionImpact): number {
  const score =
    impact.taste.score * 0.4 +
    impact.texture.score * 0.25 +
    impact.authenticity.score * 0.35;

  return Math.round((score / 5) * 100);
}

/**
 * Get a human-readable compatibility label.
 */
export function compatibilityLabel(score: number): string {
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Good match";
  if (score >= 50) return "Acceptable";
  if (score >= 30) return "Significant change";
  return "Major change";
}

/**
 * Rank substitutes by overall compatibility score.
 */
export function rankSubstitutes(options: SubstituteOption[]): SubstituteOption[] {
  return [...options].sort(
    (a, b) => overallScore(b.impact) - overallScore(a.impact)
  );
}

/**
 * Generate a quantity instruction string for a substitute.
 * E.g., "Use 150 ml of Cashew paste (75% of original)"
 */
export function quantityInstruction(
  substitute: SubstituteOption,
  originalAmount: number,
  originalUnit: string
): string {
  const mapping = substitute.quantityMapping;
  const newAmount = Math.round(originalAmount * mapping.ratio * 100) / 100;
  const unit = mapping.unit || originalUnit;

  let instruction = `Use ${newAmount} ${unit} of ${substitute.name}`;

  if (mapping.ratio !== 1) {
    const pct = Math.round(mapping.ratio * 100);
    instruction += ` (${pct}% of original)`;
  }

  if (mapping.note) {
    instruction += `. ${mapping.note}`;
  }

  return instruction;
}

/**
 * Determine the authenticity level after substitution.
 */
export function authenticityLevel(
  impact: SubstitutionImpact
): "authentic" | "adapted" | "modified" {
  if (impact.authenticity.score >= 4) return "authentic";
  if (impact.authenticity.score >= 3) return "adapted";
  return "modified";
}
