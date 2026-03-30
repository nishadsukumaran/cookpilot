/**
 * Recipe Transformation Engine — Public API
 *
 * Deterministic engine for scaling, converting, and adjusting recipes.
 * All calculations use pure functions. No AI needed for this layer.
 *
 * Usage:
 *   import { transformRecipe, convertRecipeUnits, planCalorieReduction } from "@/lib/engines/transformation";
 */

import type {
  Ingredient,
  TransformationResult,
  TransformationWarning,
  UnitSystem,
  CalorieAdjustment,
  CalorieStrategy,
} from "../types";
import { scaleIngredients, getScaleRatio } from "./scaling";
import { convertToSystem, roundKitchen, convertUnit, isConvertibleUnit } from "./units";
import { estimateCalories, planCalorieReduction as planReduction } from "./calories";
import { generateWarnings } from "./warnings";

// ─── Main Transform Function ────────────────────────

export interface TransformOptions {
  targetServings?: number;
  unitSystem?: UnitSystem;
  targetCaloriesPerServing?: number;
  calorieStrategy?: CalorieStrategy;
}

/**
 * Apply one or more transformations to a recipe's ingredients.
 *
 * Transformations are applied in order:
 * 1. Serving scale (if targetServings differs)
 * 2. Unit conversion (if unitSystem specified)
 * 3. Calorie adjustment (if targetCalories specified)
 * 4. Warning generation (always)
 */
export function transformRecipe(
  ingredients: Ingredient[],
  originalServings: number,
  originalCaloriesPerServing: number,
  options: TransformOptions
): TransformationResult {
  const {
    targetServings = originalServings,
    unitSystem,
    targetCaloriesPerServing,
    calorieStrategy = "smart-swap",
  } = options;

  let current = ingredients.map((i) => ({ ...i }));
  const allWarnings: TransformationWarning[] = [];

  // Step 1: Scale by servings
  if (targetServings !== originalServings) {
    const result = scaleIngredients(current, originalServings, targetServings);
    current = result.ingredients;
    allWarnings.push(...result.warnings);
  }

  // Step 2: Convert units
  if (unitSystem) {
    current = current.map((ing) => {
      const converted = convertToSystem(ing.amount, ing.unit, unitSystem);
      return { ...ing, amount: converted.amount, unit: converted.unit };
    });
  }

  // Step 3: Calorie adjustment
  // Calories per serving stays constant when scaling — only total changes
  let calories = originalCaloriesPerServing;

  if (targetCaloriesPerServing && targetCaloriesPerServing < calories) {
    const plan = planReduction(
      current,
      targetServings,
      targetCaloriesPerServing,
      calorieStrategy
    );

    // Apply modifications
    for (const mod of plan.modifications) {
      const idx = current.findIndex(
        (i) => i.name.toLowerCase() === mod.ingredient.toLowerCase()
      );
      if (idx !== -1) {
        current[idx] = { ...current[idx], amount: mod.newAmount };
      }
    }

    calories = targetCaloriesPerServing;

    if (plan.reductionPercent > 25) {
      allWarnings.push({
        severity: "caution",
        message: `Calories reduced by ${plan.reductionPercent}%. Taste and texture may be noticeably different.`,
      });
    }
  }

  // Step 4: Generate warnings
  const contextWarnings = generateWarnings({
    originalIngredients: ingredients,
    modifiedIngredients: current,
    originalServings,
    newServings: targetServings,
  });
  allWarnings.push(...contextWarnings);

  // Deduplicate warnings
  const seen = new Set<string>();
  const uniqueWarnings = allWarnings.filter((w) => {
    if (seen.has(w.message)) return false;
    seen.add(w.message);
    return true;
  });

  return {
    ingredients: current,
    calories,
    servings: targetServings,
    warnings: uniqueWarnings,
    changes: [], // TODO: track detailed changes for UI diff display
  };
}

// ─── Re-exports ─────────────────────────────────────

export {
  scaleIngredients,
  getScaleRatio,
} from "./scaling";

export {
  convertUnit,
  convertToSystem,
  roundKitchen,
  isConvertibleUnit,
  isVolumeUnit,
  isWeightUnit,
  isDescriptiveUnit,
} from "./units";

export {
  estimateCalories,
  planCalorieReduction,
} from "./calories";

export {
  generateWarnings,
} from "./warnings";

export {
  computeTrustMetrics,
} from "./trust";

export type {
  TrustMetrics,
  ChangeItem,
  BeforeAfter,
  TransformationType,
} from "./trust";
