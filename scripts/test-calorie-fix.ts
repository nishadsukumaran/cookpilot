import { transformRecipe } from "../src/lib/engines/transformation/index.js";
import { recipes } from "../src/data/mock-data.js";
const bc = recipes.find((r) => r.id === "butter-chicken")!;
console.log("Original:", bc.calories, "cal/serving");

const r1 = transformRecipe(bc.ingredients, bc.servings, bc.calories, { targetServings: 8 });
console.log("4→8:", r1.calories, "cal/serving", r1.calories === bc.calories ? "✓" : "✗ WRONG");

const r2 = transformRecipe(bc.ingredients, bc.servings, bc.calories, { targetServings: 2 });
console.log("4→2:", r2.calories, "cal/serving", r2.calories === bc.calories ? "✓" : "✗ WRONG");

const r3 = transformRecipe(bc.ingredients, bc.servings, bc.calories, { targetServings: 4 });
console.log("4→4:", r3.calories, "cal/serving", r3.calories === bc.calories ? "✓" : "✗ WRONG");

const r4 = transformRecipe(bc.ingredients, bc.servings, bc.calories, { targetServings: 20 });
console.log("4→20:", r4.calories, "cal/serving", r4.calories === bc.calories ? "✓" : "✗ WRONG");

if (r1.calories !== bc.calories || r2.calories !== bc.calories) {
  console.log("\n❌ FAIL: Calories per serving changed during scaling!");
  process.exit(1);
} else {
  console.log("\n✅ PASS: Calories per serving stays constant during scaling");
}
