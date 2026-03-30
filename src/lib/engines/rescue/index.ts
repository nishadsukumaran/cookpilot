/**
 * Cooking Rescue Engine — Public API
 *
 * Deterministic triage for common cooking problems.
 * AI layer enriches with context-specific advice.
 *
 * Usage:
 *   import { getRescue, getAllRescueProblems } from "@/lib/engines/rescue";
 */

import type { RescueProblem, RescueSolution } from "../types";
import { findRescueSolution, findRescuesForCuisine, getAllRescues } from "./rescue-db";

// ─── Public API ─────────────────────────────────────

export interface RescueResult {
  found: boolean;
  solution: RescueSolution | null;
  urgency: "low" | "medium" | "high";
}

/**
 * Get rescue guidance for a cooking problem.
 */
export function getRescue(problem: RescueProblem): RescueResult {
  const solution = findRescueSolution(problem);

  if (!solution) {
    return { found: false, solution: null, urgency: "low" };
  }

  return {
    found: true,
    solution,
    urgency: severityToUrgency(solution.severity),
  };
}

/**
 * Get all rescue problem types for UI display.
 */
export function getAllRescueProblems(): Array<{
  id: RescueProblem;
  label: string;
  icon: string;
  severity: string;
}> {
  return getAllRescues().map((r) => ({
    id: r.problem,
    label: r.label,
    icon: r.icon,
    severity: r.severity,
  }));
}

/**
 * Get rescue suggestions relevant to a cuisine.
 */
export function getRescuesForCuisine(cuisine: string): RescueSolution[] {
  return findRescuesForCuisine(cuisine);
}

// ─── Internal ───────────────────────────────────────

function severityToUrgency(severity: string): "low" | "medium" | "high" {
  switch (severity) {
    case "severe":
      return "high";
    case "moderate":
      return "medium";
    default:
      return "low";
  }
}

// ─── Re-exports ─────────────────────────────────────

export { findRescueSolution, getAllRescues, findRescuesForCuisine } from "./rescue-db";
