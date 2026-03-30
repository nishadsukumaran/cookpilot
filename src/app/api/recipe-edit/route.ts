import { NextResponse } from "next/server";
import { getRecipeById } from "@/data/mock-data";
import { applyEdit } from "@/lib/engines/recipe-edit/engine";
import { ai } from "@/lib/ai";
import { logAiInteraction } from "@/lib/db/queries";
import { createTrace, isDev } from "@/lib/debug/types";
import type { EditAction } from "@/lib/engines/recipe-edit/types";

interface RecipeEditRequest {
  recipeId: string;
  action: EditAction;
}

export async function POST(req: Request) {
  const body: RecipeEditRequest = await req.json();
  const { recipeId, action } = body;

  if (!recipeId || !action?.type) {
    return NextResponse.json({ error: "recipeId and action are required" }, { status: 400 });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const trace = createTrace();

  // --- Structured Edit -------------------------------------------
  const editStart = Date.now();
  const result = applyEdit(recipe.ingredients, action);

  trace.addStage("engine", `Edit: ${action.type} ${action.ingredientName}`, Date.now() - editStart, {
    structured_edit_used: true,
    actionType: action.type,
    ingredientName: action.ingredientName,
    success: result.success,
    warningsCount: result.warnings.length,
  });

  if (!result.success) {
    trace.addFlag("edit-failed");
  }

  // --- AI Enrichment (impact explanation) ------------------------
  const aiStart = Date.now();
  const aiResult = await ai.recipeReasoning({
    recipeName: recipe.title,
    question: result.impact.summary,
    cuisine: recipe.cuisine,
  });

  trace.addStage("ai-enrichment", "Task: recipe-reasoning (edit impact)", Date.now() - aiStart, {
    model: aiResult.model,
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
    responseLength: aiResult.content.length,
    ai_enrichment_used: true,
    ai_allowed_to_change_edit: false,
  });

  if (aiResult.wasMock) trace.addFlag("ai-mock-response");

  // Fire-and-forget AI interaction log
  logAiInteraction({
    taskType: "recipe-reasoning",
    model: aiResult.model,
    inputSummary: `Edit ${action.type}: ${action.ingredientName} in ${recipe.title}`,
    inputContext: { recipeId, actionType: action.type, ingredientName: action.ingredientName },
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
  }).catch(() => {});

  // --- Build Response --------------------------------------------
  const payload = {
    success: result.success,
    ingredientsAfter: result.ingredientsAfter,
    impact: result.impact,
    explanation: aiResult.content,
    warnings: result.warnings,
    ...(isDev()
      ? {
          _trace: trace.finish({
            structured: true,
            ai: true,
            mock: aiResult.wasMock,
          }),
        }
      : {}),
  };

  return NextResponse.json(payload);
}
