/**
 * Ingredient Substitution Engine — Public API
 *
 * Deterministic ingredient substitution lookup with impact analysis.
 * AI layer can enrich these results with contextual reasoning.
 *
 * Usage:
 *   import { findSubstitutesFor, getSubstitutionSummary } from "@/lib/engines/substitution";
 */

import type { SubstitutionEntry, SubstituteOption, Ingredient } from "../types";
import { findSubstitutions, getAllSubstitutions } from "./substitution-db";
import {
  overallScore,
  compatibilityLabel,
  rankSubstitutes,
  quantityInstruction,
  authenticityLevel,
} from "./analyzer";

// ─── Public API ─────────────────────────────────────

export interface SubstitutionResult {
  original: string;
  found: boolean;
  best: SubstituteDetail | null;
  fallback: SubstituteDetail | null;
  all: SubstituteDetail[];
}

export interface SubstituteDetail {
  name: string;
  tier: "best" | "fallback";
  score: number;
  scoreLabel: string;
  quantityInstruction: string;
  authenticityLevel: "authentic" | "adapted" | "modified";
  impact: {
    taste: { score: number; description: string };
    texture: { score: number; description: string };
    authenticity: { score: number; description: string };
    summary: string;
  };
}

/**
 * Find all substitutes for an ingredient with full analysis.
 */
export function findSubstitutesFor(
  ingredientName: string,
  originalAmount?: number,
  originalUnit?: string
): SubstitutionResult {
  const entry = findSubstitutions(ingredientName);

  if (!entry) {
    return {
      original: ingredientName,
      found: false,
      best: null,
      fallback: null,
      all: [],
    };
  }

  const ranked = rankSubstitutes(entry.substitutes);
  const details = ranked.map((sub) => toDetail(sub, originalAmount, originalUnit));

  return {
    original: entry.original,
    found: true,
    best: details.find((d) => d.tier === "best") || details[0] || null,
    fallback: details.find((d) => d.tier === "fallback") || null,
    all: details,
  };
}

/**
 * Check which ingredients in a recipe have known substitutions.
 */
export function findAllSubstitutableIngredients(
  ingredients: Ingredient[]
): Map<string, SubstitutionResult> {
  const results = new Map<string, SubstitutionResult>();

  for (const ing of ingredients) {
    const result = findSubstitutesFor(ing.name, ing.amount, ing.unit);
    if (result.found) {
      results.set(ing.name, result);
    }
  }

  return results;
}

/**
 * Generate a concise summary for a substitution.
 */
export function getSubstitutionSummary(
  ingredientName: string,
  substituteName: string
): string | null {
  const entry = findSubstitutions(ingredientName);
  if (!entry) return null;

  const sub = entry.substitutes.find(
    (s) => s.name.toLowerCase() === substituteName.toLowerCase()
  );
  if (!sub) return null;

  const score = overallScore(sub.impact);
  const label = compatibilityLabel(score);

  return `${sub.name} is a ${label.toLowerCase()} for ${entry.original} (${score}% compatibility). ${sub.impact.summary}`;
}

// ─── Internal ───────────────────────────────────────

function toDetail(
  sub: SubstituteOption,
  amount?: number,
  unit?: string
): SubstituteDetail {
  const score = overallScore(sub.impact);

  return {
    name: sub.name,
    tier: sub.tier,
    score,
    scoreLabel: compatibilityLabel(score),
    quantityInstruction: quantityInstruction(sub, amount ?? 1, unit ?? "unit"),
    authenticityLevel: authenticityLevel(sub.impact),
    impact: sub.impact,
  };
}

// ─── Re-exports ─────────────────────────────────────

export {
  overallScore,
  compatibilityLabel,
  rankSubstitutes,
  authenticityLevel,
} from "./analyzer";

export { findSubstitutions, getAllSubstitutions } from "./substitution-db";
