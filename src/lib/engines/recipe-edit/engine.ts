/**
 * Deterministic recipe edit engine.
 *
 * Applies structured edit actions to an ingredient list.
 * Pure functions — no AI, no side effects.
 */

import type { Ingredient } from "../types";
import type { EditAction, EditResult, EditImpact } from "./types";

/**
 * Apply a single edit action to an ingredient list.
 */
export function applyEdit(
  ingredients: Ingredient[],
  action: EditAction
): EditResult {
  const before = ingredients.map((i) => ({ ...i }));
  let after: Ingredient[];
  let warnings: string[] = [];
  let success = true;

  switch (action.type) {
    case "remove":
      after = applyRemove(before, action, warnings);
      break;
    case "replace":
      after = applyReplace(before, action, warnings);
      break;
    case "add":
      after = applyAdd(before, action, warnings);
      break;
    case "adjust-amount":
      after = applyAdjustAmount(before, action, warnings);
      break;
    default:
      after = before;
      warnings.push(`Unknown edit action: ${action.type}`);
      success = false;
  }

  // Check if anything actually changed
  if (JSON.stringify(before) === JSON.stringify(after)) {
    success = false;
    warnings.push("No changes were made");
  }

  return {
    success,
    action,
    ingredientsBefore: before,
    ingredientsAfter: after,
    impact: assessEditImpact(before, after, action),
    warnings,
  };
}

/**
 * Apply multiple edit actions in sequence.
 */
export function applyEdits(
  ingredients: Ingredient[],
  actions: EditAction[]
): EditResult[] {
  let current = ingredients.map((i) => ({ ...i }));
  const results: EditResult[] = [];

  for (const action of actions) {
    const result = applyEdit(current, action);
    results.push(result);
    if (result.success) {
      current = result.ingredientsAfter;
    }
  }

  return results;
}

// ─── Action Implementations ─────────────────────────

function applyRemove(
  ingredients: Ingredient[],
  action: EditAction,
  warnings: string[]
): Ingredient[] {
  const match = findIngredientWithConfidence(ingredients, action.ingredientName);
  if (match.index === -1) {
    warnings.push(`Ingredient "${action.ingredientName}" not found in recipe`);
    return ingredients;
  }
  if (match.confidence === "partial") {
    warnings.push(
      `Matched '${action.ingredientName}' to '${match.matchedName}' (partial match) — verify this is correct`
    );
  }

  const idx = match.index;
  const removed = ingredients[idx];
  if (removed.category === "protein") {
    warnings.push(`Removing ${removed.name} (protein) will fundamentally change the dish`);
  }
  if (removed.category === "spice") {
    warnings.push(`Removing ${removed.name} may affect the dish's signature flavor`);
  }

  return ingredients.filter((_, i) => i !== idx);
}

function applyReplace(
  ingredients: Ingredient[],
  action: EditAction,
  warnings: string[]
): Ingredient[] {
  if (!action.replacement) {
    warnings.push("Replacement ingredient not specified");
    return ingredients;
  }

  const match = findIngredientWithConfidence(ingredients, action.ingredientName);
  if (match.index === -1) {
    warnings.push(`Ingredient "${action.ingredientName}" not found in recipe`);
    return ingredients;
  }
  if (match.confidence === "partial") {
    warnings.push(
      `Matched '${action.ingredientName}' to '${match.matchedName}' (partial match) — verify this is correct`
    );
  }

  const result = [...ingredients];
  result[match.index] = action.replacement;
  return result;
}

function applyAdd(
  ingredients: Ingredient[],
  action: EditAction,
  warnings: string[]
): Ingredient[] {
  if (!action.newIngredient) {
    warnings.push("New ingredient not specified");
    return ingredients;
  }

  // Check for duplicates
  const existing = findIngredient(ingredients, action.newIngredient.name);
  if (existing !== -1) {
    warnings.push(`${action.newIngredient.name} already exists — adjusting amount instead`);
    const result = [...ingredients];
    result[existing] = {
      ...result[existing],
      amount: result[existing].amount + action.newIngredient.amount,
    };
    return result;
  }

  return [...ingredients, action.newIngredient];
}

function applyAdjustAmount(
  ingredients: Ingredient[],
  action: EditAction,
  warnings: string[]
): Ingredient[] {
  const idx = findIngredient(ingredients, action.ingredientName);
  if (idx === -1) {
    warnings.push(`Ingredient "${action.ingredientName}" not found`);
    return ingredients;
  }

  if (action.newAmount == null || action.newAmount <= 0) {
    warnings.push("Invalid amount — use 'remove' to eliminate an ingredient");
    return ingredients;
  }

  const result = [...ingredients];
  result[idx] = {
    ...result[idx],
    amount: action.newAmount,
    unit: action.newUnit ?? result[idx].unit,
  };
  return result;
}

// ─── Impact Assessment ──────────────────────────────

function assessEditImpact(
  before: Ingredient[],
  after: Ingredient[],
  action: EditAction
): EditImpact {
  const removedCount = before.length - after.length;
  const addedCount = after.length - before.length;

  if (action.type === "remove") {
    const removed = before.find(
      (i) => !after.some((a) => a.name === i.name)
    );
    const category = removed?.category ?? "other";

    if (category === "protein") {
      return {
        tasteChange: "significant",
        textureChange: "significant",
        authenticityChange: "significant",
        calorieDirection: "lower",
        summary: `Removing ${removed?.name} fundamentally changes the dish.`,
      };
    }
    if (category === "dairy" || category === "oil") {
      return {
        tasteChange: "minor",
        textureChange: "significant",
        authenticityChange: "minor",
        calorieDirection: "lower",
        summary: `Removing ${removed?.name} reduces richness and calories.`,
      };
    }
    return {
      tasteChange: "minor",
      textureChange: "none",
      authenticityChange: "minor",
      calorieDirection: "same",
      summary: `Removing ${removed?.name} has moderate impact.`,
    };
  }

  if (action.type === "replace") {
    return {
      tasteChange: "minor",
      textureChange: "minor",
      authenticityChange: "minor",
      calorieDirection: "unknown",
      summary: `Replaced ${action.ingredientName} with ${action.replacement?.name ?? "alternative"}.`,
    };
  }

  if (action.type === "add") {
    return {
      tasteChange: "minor",
      textureChange: "none",
      authenticityChange: "none",
      calorieDirection: "higher",
      summary: `Added ${action.newIngredient?.name ?? "ingredient"} to the recipe.`,
    };
  }

  return {
    tasteChange: "none",
    textureChange: "none",
    authenticityChange: "none",
    calorieDirection: "same",
    summary: "Adjusted ingredient amount.",
  };
}

// ─── Helpers ────────────────────────────────────────

export interface IngredientMatch {
  index: number;
  confidence: "exact" | "partial" | "none";
  matchedName: string | null;
}

/**
 * Find an ingredient with confidence level indicating match quality.
 *
 * - "exact": case-insensitive exact name match
 * - "partial": one name includes the other (fuzzy match)
 * - "none": no match found
 */
export function findIngredientWithConfidence(
  ingredients: Ingredient[],
  name: string
): IngredientMatch {
  const lower = name.toLowerCase().trim();

  // First pass: exact match (case-insensitive)
  const exactIdx = ingredients.findIndex(
    (i) => i.name.toLowerCase().trim() === lower
  );
  if (exactIdx !== -1) {
    return { index: exactIdx, confidence: "exact", matchedName: ingredients[exactIdx].name };
  }

  // Second pass: partial match (one name includes the other)
  const partialIdx = ingredients.findIndex(
    (i) =>
      i.name.toLowerCase().includes(lower) ||
      lower.includes(i.name.toLowerCase())
  );
  if (partialIdx !== -1) {
    return { index: partialIdx, confidence: "partial", matchedName: ingredients[partialIdx].name };
  }

  return { index: -1, confidence: "none", matchedName: null };
}

function findIngredient(ingredients: Ingredient[], name: string): number {
  return findIngredientWithConfidence(ingredients, name).index;
}
