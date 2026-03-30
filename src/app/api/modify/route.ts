import { NextResponse } from "next/server";
import { getRecipeById } from "@/data/mock-data";
import { planCalorieReduction, estimateCalories, transformRecipe } from "@/lib/engines/transformation";
import { computeTrustMetrics } from "@/lib/engines/transformation/trust";
import { ai } from "@/lib/ai";
import { logAiInteraction } from "@/lib/db/queries";
import { createTrace, isDev } from "@/lib/debug/types";
import type { ModificationResponse, ModificationType, ImpactLevel, CalorieStrategy } from "@/lib/engines/types";

interface ModifyRequest {
  recipeId: string;
  modificationType: ModificationType;
  targetReductionPercent?: number; // e.g. 20 for 20%
  targetCalories?: number;        // absolute target per serving
  servings?: number;
  strategy?: CalorieStrategy;
}

export async function POST(req: Request) {
  const body: ModifyRequest = await req.json();
  const { recipeId, modificationType, targetReductionPercent, targetCalories, strategy } = body;

  if (!recipeId || !modificationType) {
    return NextResponse.json({ error: "recipeId and modificationType are required" }, { status: 400 });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const trace = createTrace();
  const servings = body.servings ?? recipe.servings;

  // ─── Structured Calculation ───────────────────────
  const calcStart = Date.now();
  const currentCalories = estimateCalories(recipe.ingredients, servings);

  let targetCals: number;
  if (targetCalories) {
    targetCals = targetCalories;
  } else if (targetReductionPercent) {
    targetCals = Math.round(currentCalories * (1 - targetReductionPercent / 100));
  } else {
    targetCals = Math.round(currentCalories * 0.8); // default 20% reduction
  }

  const plan = planCalorieReduction(
    recipe.ingredients,
    servings,
    targetCals,
    strategy ?? "smart-swap"
  );

  trace.addStage("engine", `Calorie plan: ${currentCalories} → ${targetCals} cal/serving`, Date.now() - calcStart, {
    structured_modification_used: true,
    originalCalories: currentCalories,
    targetCalories: targetCals,
    reductionPercent: plan.reductionPercent,
    modificationsCount: plan.modifications.length,
    strategy: strategy ?? "smart-swap",
  });

  // Build a human-readable plan summary for the AI prompt
  const planSummary = plan.modifications.length > 0
    ? plan.modifications
        .map((m) => `- ${m.ingredient}: ${m.originalAmount} ${m.unit} → ${m.newAmount} ${m.unit} (saves ~${m.caloriesSaved} cal/serving) — ${m.note}`)
        .join("\n") + `\nResult: ${currentCalories} → ~${targetCals} cal/serving (${plan.reductionPercent}% reduction)`
    : "No reductions needed — the dish is already at or below the target calorie level.";

  // ─── AI Enrichment ────────────────────────────────
  const aiStart = Date.now();
  const aiResult = await ai.modificationAnalysis({
    recipeName: recipe.title,
    cuisine: recipe.cuisine,
    modificationType,
    structuredPlan: planSummary,
  });

  trace.addStage("ai-enrichment", "Task: modification-analysis", Date.now() - aiStart, {
    model: aiResult.model,
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
    responseLength: aiResult.content.length,
    ai_enrichment_used: true,
    ai_allowed_to_change_primary_modification: false,
  });

  if (aiResult.wasMock) trace.addFlag("ai-mock-response");

  logAiInteraction({
    taskType: "modification-analysis",
    model: aiResult.model,
    inputSummary: `${modificationType}: ${recipe.title} (${plan.reductionPercent}% reduction)`,
    inputContext: { recipeId, modificationType, targetCals, reductionPercent: plan.reductionPercent },
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
  }).catch(() => {});

  // ─── Build Typed Response ─────────────────────────
  const warnings: string[] = [];
  if (plan.reductionPercent > 30) {
    warnings.push("Large calorie reduction — taste and texture will be noticeably different.");
  }
  if (plan.modifications.some((m) => m.ingredient.toLowerCase().includes("cream") && m.newAmount / m.originalAmount < 0.5)) {
    warnings.push("Cream reduced significantly — the dish will lose some creaminess.");
  }
  if (plan.modifications.some((m) => m.ingredient.toLowerCase().includes("butter") && m.newAmount / m.originalAmount < 0.5)) {
    warnings.push("Butter reduced significantly — signature richness will be affected.");
  }

  const response: ModificationResponse = {
    modificationType,
    recipeName: recipe.title,
    originalCalories: currentCalories,
    newCalories: targetCals,
    reductionPercent: plan.reductionPercent,
    primaryChanges: plan.modifications,
    ingredientAdjustments: plan.modifications.map((m) => ({
      ingredient: m.ingredient,
      from: `${m.originalAmount} ${m.unit}`,
      to: `${m.newAmount} ${m.unit}`,
      reason: m.note,
    })),
    expectedTasteChange: assessImpact(plan.reductionPercent, "taste"),
    expectedTextureChange: assessImpact(plan.reductionPercent, "texture"),
    authenticityImpact: assessImpact(plan.reductionPercent, "authenticity"),
    calorieImpact: `${currentCalories} → ${targetCals} cal/serving (${plan.reductionPercent}% reduction)`,
    warnings,
    explanation: aiResult.content,
    confidence: plan.modifications.length > 0 ? (plan.reductionPercent <= 25 ? "high" : "medium") : "high",
  };

  // Compute trust metrics from the modified ingredients
  const modifiedIngredients = recipe.ingredients.map((ing) => {
    const mod = plan.modifications.find(
      (m) => m.ingredient.toLowerCase() === ing.name.toLowerCase()
    );
    return mod ? { ...ing, amount: mod.newAmount } : ing;
  });

  const trustMetrics = computeTrustMetrics(
    recipe.ingredients,
    modifiedIngredients,
    currentCalories,
    targetCals,
    [] // warnings already computed above
  );

  const payload = {
    ...response,
    trust: trustMetrics,
    ...(isDev() ? { _trace: trace.finish({ structured: true, ai: true, mock: aiResult.wasMock }) } : {}),
  };

  return NextResponse.json(payload);
}

// ─── Impact Assessment (deterministic) ──────────────

function assessImpact(reductionPercent: number, dimension: string): ImpactLevel {
  if (reductionPercent <= 10) {
    return { level: "none", description: `Minimal ${dimension} change at this reduction level.` };
  }
  if (reductionPercent <= 20) {
    return {
      level: "minor",
      description: dimension === "authenticity"
        ? "Still recognizably the same dish."
        : `Slight ${dimension} difference, most people won't notice.`,
    };
  }
  if (reductionPercent <= 35) {
    return {
      level: "moderate",
      description: dimension === "authenticity"
        ? "An adapted version — recognizable but lighter than traditional."
        : `Noticeable ${dimension} change. The dish is lighter but different.`,
    };
  }
  return {
    level: "significant",
    description: dimension === "authenticity"
      ? "Significantly adapted — a 'healthy version' rather than the traditional dish."
      : `Major ${dimension} change. Consider this a different take on the dish.`,
  };
}
