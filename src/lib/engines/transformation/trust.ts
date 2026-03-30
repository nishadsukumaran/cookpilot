/**
 * Trust metrics — confidence, risk, authenticity score, change summary.
 *
 * Pure functions that compute trust/experience layer data from
 * existing transformation results. No new engines — just derived data.
 */

import type { Ingredient, TransformationWarning } from "../types";

// ─── Types ──────────────────────────────────────────

export interface TrustMetrics {
  confidence: { score: number; label: string };
  risk: { level: "low" | "medium" | "high"; reasons: string[] };
  authenticity: { score: number; label: string };
  changeSummary: ChangeItem[];
  comparison: BeforeAfter;
}

export interface ChangeItem {
  ingredient: string;
  from: string;
  to: string;
  direction: "reduced" | "increased" | "unchanged" | "removed";
}

export interface BeforeAfter {
  calories: { before: number; after: number; diff: number; percent: number };
  keyChanges: Array<{ label: string; before: string; after: string }>;
  tasteSummary: string;
  textureSummary: string;
  authenticitySummary: string;
}

// ─── Compute Trust Metrics ──────────────────────────

export type TransformationType = "scaling" | "substitution" | "modification";

export function computeTrustMetrics(
  originalIngredients: Ingredient[],
  modifiedIngredients: Ingredient[],
  originalCalories: number,
  newCalories: number,
  warnings: TransformationWarning[],
  transformationType: TransformationType = "modification"
): TrustMetrics {
  // Scaling does NOT affect trust — taste, authenticity, and confidence are unchanged
  if (transformationType === "scaling") {
    return {
      confidence: { score: 99, label: "High — scaling only, no recipe changes" },
      risk: { level: "low", reasons: ["Scaling does not change recipe composition"] },
      authenticity: { score: 100, label: "Authentic" },
      changeSummary: [],
      comparison: {
        calories: { before: originalCalories, after: originalCalories, diff: 0, percent: 0 },
        keyChanges: [],
        tasteSummary: "Identical — only portion size changed",
        textureSummary: "Unchanged",
        authenticitySummary: "True to the original recipe",
      },
    };
  }

  const changeSummary = buildChangeSummary(originalIngredients, modifiedIngredients);
  const totalChanges = changeSummary.filter((c) => c.direction !== "unchanged").length;
  const removedCount = changeSummary.filter((c) => c.direction === "removed").length;
  const calorieDiff = originalCalories - newCalories;
  const caloriePercent = originalCalories > 0 ? Math.round((calorieDiff / originalCalories) * 100) : 0;

  return {
    confidence: computeConfidence(totalChanges, caloriePercent, warnings),
    risk: computeRisk(totalChanges, caloriePercent, removedCount, warnings),
    authenticity: computeAuthenticity(originalIngredients, modifiedIngredients, caloriePercent),
    changeSummary,
    comparison: {
      calories: {
        before: originalCalories,
        after: newCalories,
        diff: calorieDiff,
        percent: caloriePercent,
      },
      keyChanges: changeSummary
        .filter((c) => c.direction !== "unchanged")
        .slice(0, 5)
        .map((c) => ({ label: c.ingredient, before: c.from, after: c.to })),
      tasteSummary: tasteSummaryFromChanges(caloriePercent, totalChanges),
      textureSummary: textureSummaryFromChanges(caloriePercent, changeSummary),
      authenticitySummary: authenticitySummaryFromScore(
        computeAuthenticity(originalIngredients, modifiedIngredients, caloriePercent).score
      ),
    },
  };
}

// ─── Confidence ─────────────────────────────────────

function computeConfidence(
  totalChanges: number,
  caloriePercent: number,
  warnings: TransformationWarning[]
): { score: number; label: string } {
  let score = 95;

  // Deduct for changes
  score -= totalChanges * 3;
  score -= caloriePercent * 0.5;
  score -= warnings.filter((w) => w.severity === "critical").length * 15;
  score -= warnings.filter((w) => w.severity === "caution").length * 5;

  score = Math.max(20, Math.min(99, Math.round(score)));

  const label =
    score >= 85 ? "High — changes are well-understood"
    : score >= 60 ? "Medium — some uncertainty in outcome"
    : "Low — significant changes, taste carefully";

  return { score, label };
}

// ─── Risk ───────────────────────────────────────────

function computeRisk(
  totalChanges: number,
  caloriePercent: number,
  removedCount: number,
  warnings: TransformationWarning[]
): { level: "low" | "medium" | "high"; reasons: string[] } {
  const reasons: string[] = [];

  if (caloriePercent > 30) reasons.push("Large calorie reduction may affect dish character");
  if (removedCount > 0) reasons.push(`${removedCount} ingredient(s) removed entirely`);
  if (totalChanges > 5) reasons.push("Many ingredients changed simultaneously");
  if (warnings.some((w) => w.severity === "critical")) reasons.push("Critical warning from transformation engine");

  const level =
    reasons.length === 0 ? "low"
    : reasons.length <= 2 && caloriePercent <= 25 ? "medium"
    : "high";

  return { level, reasons: reasons.length > 0 ? reasons : ["No significant risks detected"] };
}

// ─── Authenticity Score ─────────────────────────────

function computeAuthenticity(
  original: Ingredient[],
  modified: Ingredient[],
  caloriePercent: number
): { score: number; label: string } {
  let score = 100;

  // Check each ingredient for changes
  for (const orig of original) {
    const mod = modified.find((m) => m.name === orig.name);
    if (!mod) {
      // Removed
      score -= orig.category === "protein" ? 25 : orig.category === "spice" ? 5 : 10;
    } else if (mod.amount !== orig.amount) {
      const ratio = mod.amount / orig.amount;
      if (ratio < 0.5) {
        score -= orig.category === "dairy" ? 8 : orig.category === "oil" ? 5 : 3;
      } else if (ratio < 0.8) {
        score -= 2;
      }
    }
  }

  // Spice profile check — if spices are unchanged, boost score
  const spicesUnchanged = original
    .filter((i) => i.category === "spice")
    .every((orig) => {
      const mod = modified.find((m) => m.name === orig.name);
      return mod && Math.abs(mod.amount - orig.amount) < 0.1;
    });
  if (spicesUnchanged && score < 95) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label =
    score >= 90 ? "Authentic"
    : score >= 70 ? "Slightly Adapted"
    : score >= 50 ? "Adapted"
    : "Significantly Modified";

  return { score, label };
}

// ─── Change Summary ─────────────────────────────────

function buildChangeSummary(
  original: Ingredient[],
  modified: Ingredient[]
): ChangeItem[] {
  return original.map((orig) => {
    const mod = modified.find((m) => m.name === orig.name);
    if (!mod) {
      return {
        ingredient: orig.name,
        from: `${orig.amount} ${orig.unit}`,
        to: "removed",
        direction: "removed" as const,
      };
    }
    if (mod.amount === orig.amount) {
      return {
        ingredient: orig.name,
        from: `${orig.amount} ${orig.unit}`,
        to: `${mod.amount} ${mod.unit}`,
        direction: "unchanged" as const,
      };
    }
    return {
      ingredient: orig.name,
      from: `${orig.amount} ${orig.unit}`,
      to: `${mod.amount} ${mod.unit}`,
      direction: mod.amount < orig.amount ? "reduced" as const : "increased" as const,
    };
  });
}

// ─── Summary Generators ─────────────────────────────

function tasteSummaryFromChanges(caloriePercent: number, totalChanges: number): string {
  if (caloriePercent <= 10 && totalChanges <= 2) return "Virtually identical taste";
  if (caloriePercent <= 20) return "Slightly lighter, core flavors preserved";
  if (caloriePercent <= 35) return "Noticeably lighter, spice profile intact";
  return "Significantly different — a healthier interpretation";
}

function textureSummaryFromChanges(caloriePercent: number, changes: ChangeItem[]): string {
  const dairyReduced = changes.some(
    (c) => c.direction === "reduced" && /cream|butter|yogurt|milk/i.test(c.ingredient)
  );
  if (!dairyReduced) return "Texture unchanged";
  if (caloriePercent <= 20) return "Slightly less creamy";
  return "Noticeably less rich and creamy";
}

function authenticitySummaryFromScore(score: number): string {
  if (score >= 90) return "True to the original recipe";
  if (score >= 70) return "Minor adaptations, still recognizable";
  if (score >= 50) return "Adapted — a lighter version of the original";
  return "Significantly modified — inspired by the original";
}
