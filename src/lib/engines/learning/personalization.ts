/**
 * Personalization bias — derives modification biases from user preferences.
 *
 * Does not change core engine logic. Produces a PersonalizationBias
 * that the confidence layer and prompt builders can use.
 */

import type { PersonalizationBias } from "./types";

interface UserPrefs {
  spicePreference?: string | null;
  calorieGoal?: number | null;
  authenticityPreference?: string | null;
  unitSystem?: string | null;
}

/**
 * Convert raw user preferences into actionable bias values.
 */
export function derivePersonalizationBias(prefs: UserPrefs | null): PersonalizationBias {
  if (!prefs) return defaultBias();

  return {
    spiceMultiplier: spiceToMultiplier(prefs.spicePreference),
    calorieTarget: prefs.calorieGoal ?? undefined,
    authenticityStrictness: authenticityToStrictness(prefs.authenticityPreference),
    unitSystem: (prefs.unitSystem === "imperial" ? "imperial" : "metric"),
  };
}

/**
 * Generate a short personalization context string for AI prompts.
 * Returns null if no meaningful personalization exists.
 */
export function personalizationContext(bias: PersonalizationBias): string | null {
  const parts: string[] = [];

  if (bias.spiceMultiplier < 0.8) parts.push("User prefers mild food");
  else if (bias.spiceMultiplier > 1.2) parts.push("User enjoys very spicy food");

  if (bias.calorieTarget) parts.push(`User's calorie target: ${bias.calorieTarget} cal/serving`);

  if (bias.authenticityStrictness > 1.0) parts.push("User values strict authenticity");
  else if (bias.authenticityStrictness < 0.9) parts.push("User is open to adapted versions");

  return parts.length > 0 ? parts.join(". ") + "." : null;
}

function defaultBias(): PersonalizationBias {
  return {
    spiceMultiplier: 1.0,
    calorieTarget: undefined,
    authenticityStrictness: 1.0,
    unitSystem: "metric",
  };
}

function spiceToMultiplier(pref?: string | null): number {
  switch (pref) {
    case "mild": return 0.6;
    case "medium": return 1.0;
    case "hot": return 1.3;
    case "very_hot": return 1.5;
    default: return 1.0;
  }
}

function authenticityToStrictness(pref?: string | null): number {
  switch (pref) {
    case "strict": return 1.2;
    case "flexible": return 1.0;
    case "adventurous": return 0.8;
    default: return 1.0;
  }
}
