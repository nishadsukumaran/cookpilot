/**
 * Recipe editing types.
 *
 * Edit actions are structured commands — not free-text mutations.
 * The chat layer converts natural language into these typed actions,
 * then the edit engine applies them deterministically.
 */

import type { Ingredient } from "../types";

export type EditActionType = "remove" | "replace" | "add" | "adjust-amount";

export interface EditAction {
  type: EditActionType;
  ingredientName: string;
  /** For replace: the new ingredient */
  replacement?: Ingredient;
  /** For add: the new ingredient to add */
  newIngredient?: Ingredient;
  /** For adjust-amount: the new amount */
  newAmount?: number;
  newUnit?: string;
  /** Reason for the edit (from user or substitution engine) */
  reason?: string;
}

export interface EditResult {
  success: boolean;
  action: EditAction;
  ingredientsBefore: Ingredient[];
  ingredientsAfter: Ingredient[];
  impact: EditImpact;
  warnings: string[];
}

export interface EditImpact {
  tasteChange: "none" | "minor" | "significant";
  textureChange: "none" | "minor" | "significant";
  authenticityChange: "none" | "minor" | "significant";
  calorieDirection: "lower" | "higher" | "same" | "unknown";
  summary: string;
}
