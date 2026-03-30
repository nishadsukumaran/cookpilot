/**
 * Butter Chicken Transformation Engine Tests
 *
 * Plain assertion tests (no framework). Run with:
 *   npx tsx src/lib/engines/transformation/__tests__/butter-chicken.test.ts
 */

import { recipes } from "@/data/mock-data";
import {
  transformRecipe,
  scaleIngredients,
  convertUnit,
  roundKitchen,
  estimateCalories,
} from "@/lib/engines/transformation";

// ─── Setup ─────────────────────────────────────────

const butterChicken = recipes.find((r) => r.id === "butter-chicken");
if (!butterChicken) {
  console.error("FAIL: Butter Chicken recipe not found in mock data");
  process.exit(1);
}

const { ingredients, servings, calories } = butterChicken;

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function findIngredient(list: typeof ingredients, name: string) {
  return list.find((i) => i.name.toLowerCase() === name.toLowerCase());
}

// ─── Test 1: Scale 4 → 8 servings ─────────────────

console.log("\n[Test 1] Scale Butter Chicken from 4 to 8 servings:");

const result4to8 = transformRecipe(ingredients, servings, calories, {
  targetServings: 8,
});

const chicken8 = findIngredient(result4to8.ingredients, "Chicken thighs");
assert(
  chicken8 !== undefined && chicken8.amount >= 1500 && chicken8.amount <= 1700,
  "Chicken thighs should roughly double (~1600g)",
  chicken8 ? `got ${chicken8.amount}g` : "ingredient not found"
);

const salt8 = findIngredient(result4to8.ingredients, "Salt");
// Salt has unit "to taste" which is NON_SCALABLE, so it should stay at 1
assert(
  salt8 !== undefined && salt8.amount <= 1.5,
  "Salt should NOT double (non-scalable 'to taste' unit)",
  salt8 ? `got ${salt8.amount}` : "ingredient not found"
);

const garamMasala8 = findIngredient(result4to8.ingredients, "Garam masala");
// Garam masala is now in SUB_LINEAR_INGREDIENTS.
// At 2x: 2 * 2^0.7 ≈ 2 * 1.62 ≈ 3.24, rounded to 3.25.
// Should be less than 4 (linear would be 4).
assert(
  garamMasala8 !== undefined && garamMasala8.amount >= 2.5 && garamMasala8.amount < 4,
  "Garam masala should scale sub-linearly (less than 2x)",
  garamMasala8 ? `got ${garamMasala8.amount} tsp` : "ingredient not found"
);

// However, the Sugar IS in the sub-linear list, so let's verify that one too
const sugar8 = findIngredient(result4to8.ingredients, "Sugar");
assert(
  sugar8 !== undefined && sugar8.amount < 2,
  "Sugar should scale sub-linearly (less than 2x from 1 tsp)",
  sugar8 ? `got ${sugar8.amount} tsp` : "ingredient not found"
);

const hasCritical4to8 = result4to8.warnings.some((w) => w.severity === "critical");
assert(
  !hasCritical4to8,
  "No 'critical' warnings for 2x scaling",
  hasCritical4to8
    ? `found critical: ${result4to8.warnings.filter((w) => w.severity === "critical").map((w) => w.message).join("; ")}`
    : undefined
);

// ─── Test 2: Scale 4 → 2 servings ─────────────────

console.log("\n[Test 2] Scale Butter Chicken from 4 to 2 servings:");

const result4to2 = transformRecipe(ingredients, servings, calories, {
  targetServings: 2,
});

const chicken2 = findIngredient(result4to2.ingredients, "Chicken thighs");
assert(
  chicken2 !== undefined && chicken2.amount >= 350 && chicken2.amount <= 450,
  "Chicken thighs should roughly halve (~400g)",
  chicken2 ? `got ${chicken2.amount}g` : "ingredient not found"
);

const yogurt2 = findIngredient(result4to2.ingredients, "Yogurt");
assert(
  yogurt2 !== undefined && yogurt2.amount >= 80 && yogurt2.amount <= 120,
  "Yogurt should roughly halve (~100ml)",
  yogurt2 ? `got ${yogurt2.amount}ml` : "ingredient not found"
);

const allPositive = result4to2.ingredients.every((i) => i.amount > 0);
assert(
  allPositive,
  "All ingredients should have amount > 0",
  allPositive
    ? undefined
    : `zero-amount found: ${result4to2.ingredients.filter((i) => i.amount === 0).map((i) => i.name).join(", ")}`
);

// ─── Test 3: Scale 4 → 20 servings (extreme) ──────

console.log("\n[Test 3] Scale Butter Chicken from 4 to 20 servings (extreme):");

const result4to20 = transformRecipe(ingredients, servings, calories, {
  targetServings: 20,
});

const hasWarning = result4to20.warnings.some(
  (w) => w.severity === "caution" || w.severity === "critical"
);
assert(
  hasWarning,
  "Should produce a 'caution' or 'critical' warning for extreme scaling (5x)",
  hasWarning
    ? `warnings: ${result4to20.warnings.filter((w) => w.severity !== "info").map((w) => `[${w.severity}] ${w.message}`).join("; ")}`
    : "no caution/critical warnings found"
);

// Check specifically for the extreme scaling warning from warnings.ts (ratio >= 5)
const hasCriticalExtreme = result4to20.warnings.some(
  (w) => w.severity === "critical" && w.message.includes("servings")
);
assert(
  hasCriticalExtreme,
  "Should have a 'critical' warning about extreme serving count",
  hasCriticalExtreme
    ? undefined
    : `warnings: ${result4to20.warnings.map((w) => `[${w.severity}] ${w.message.slice(0, 60)}...`).join("; ")}`
);

// ─── Test 4: Calorie estimation ────────────────────

console.log("\n[Test 4] Calorie estimation for Butter Chicken:");

const estimatedCals = estimateCalories(ingredients, servings);
assert(
  estimatedCals >= 300 && estimatedCals <= 900,
  `Estimated calories per serving should be 300-900 (rough estimate with calorie density lookup)`,
  `got ${estimatedCals}`
);

// Sanity check: the mock data says 490 cal/serving, estimation should be in the ballpark
assert(
  estimatedCals >= 250 && estimatedCals <= 800,
  "Estimation should be in a reasonable ballpark of 490 (mock value)",
  `got ${estimatedCals} (mock says ${calories})`
);

// ─── Test 5: Unit conversion ───────────────────────

console.log("\n[Test 5] Unit conversions:");

const cupToMl = convertUnit(1, "cup", "ml");
assert(
  cupToMl !== null && cupToMl >= 230 && cupToMl <= 240,
  "1 cup -> ml should be approximately 236",
  `got ${cupToMl}`
);

const gToOz = convertUnit(100, "g", "oz");
assert(
  gToOz !== null && gToOz >= 3.4 && gToOz <= 3.6,
  "100g -> oz should be approximately 3.5",
  `got ${gToOz}`
);

// roundKitchen should produce a kitchen-friendly number
const rounded = roundKitchen(2.33);
// 2.33 is in the 1-10 range, so rounds to nearest 0.25 -> 2.25
assert(
  rounded === 2.25 || rounded === 2.5,
  "roundKitchen(2.33) should return a kitchen-friendly number (2.25 or 2.5)",
  `got ${rounded}`
);

const roundedSmall = roundKitchen(0.33);
// 0.33 is < 1, rounds to nearest quarter -> 0.25
assert(
  roundedSmall === 0.25,
  "roundKitchen(0.33) should round to 0.25 (nearest quarter)",
  `got ${roundedSmall}`
);

const roundedLarge = roundKitchen(437);
// 437 >= 100, rounds to nearest 10 -> 440
assert(
  roundedLarge === 440,
  "roundKitchen(437) should round to 440 (nearest 10)",
  `got ${roundedLarge}`
);

// Incompatible unit conversion should return null
const incompatible = convertUnit(100, "g", "ml");
assert(
  incompatible === null,
  "Converting g -> ml should return null (incompatible without density)",
  `got ${incompatible}`
);

// ─── Summary ───────────────────────────────────────

console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
