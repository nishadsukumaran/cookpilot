import { NextResponse } from "next/server";
import { findSubstitutesFor } from "@/lib/engines/substitution";
import { ai } from "@/lib/ai";
import { logAiInteraction } from "@/lib/db/queries";
import { createTrace, isDev } from "@/lib/debug/types";

interface SubstitutionRequest {
  ingredient: string;
  amount?: number;
  unit?: string;
  recipeName?: string;
  cuisine?: string;
  category?: string;
  dishType?: string;
}

export async function POST(req: Request) {
  const body: SubstitutionRequest = await req.json();
  const { ingredient, amount, unit, recipeName, cuisine, category, dishType } = body;

  if (!ingredient?.trim()) {
    return NextResponse.json({ error: "Ingredient is required" }, { status: 400 });
  }

  const trace = createTrace();

  // ─── Structured Lookup ────────────────────────────
  const lookupStart = Date.now();
  const result = findSubstitutesFor(ingredient, amount, unit);
  trace.addStage("knowledge", result.found ? `Found: ${result.original}` : "No match", Date.now() - lookupStart, {
    ingredient,
    matched: result.found,
    structured_substitution_used: result.found,
    substitutesCount: result.all.length,
    bestName: result.best?.name ?? "none",
    bestScore: result.best?.score ?? 0,
  });

  if (!result.found) trace.addFlag("no-structured-match");

  // ─── AI Enrichment (only when structured match exists) ─
  let aiExplanation: string | undefined;
  let aiWasMock = true;

  if (result.found && result.best) {
    const aiStart = Date.now();
    const aiResult = await ai.substitutionAnalysis({
      recipeName,
      original: result.original,
      substitute: result.best.name,
      cuisine,
      category,
      dishType,
      quantityRatio: result.best.impact ? undefined : undefined, // ratio is on the SubstituteDetail
      structuredImpact: result.best.impact,
    });
    aiExplanation = aiResult.content;
    aiWasMock = aiResult.wasMock;

    trace.addStage("ai-enrichment", "Task: substitution-analysis", Date.now() - aiStart, {
      model: aiResult.model,
      latencyMs: aiResult.latencyMs,
      wasMock: aiResult.wasMock,
      responseLength: aiResult.content.length,
      ai_enrichment_used: true,
      ai_allowed_to_change_primary_substitute: false,
    });

    if (aiResult.wasMock) trace.addFlag("ai-mock-response");

    logAiInteraction({
      taskType: "substitution-analysis",
      model: aiResult.model,
      inputSummary: `${ingredient} → ${result.best.name}`,
      inputContext: { ingredient, recipeName, cuisine, category, dishType },
      latencyMs: aiResult.latencyMs,
      wasMock: aiResult.wasMock,
    }).catch(() => {});
  }

  // ─── Build Response ───────────────────────────────
  const payload = {
    ...result,
    aiExplanation,
    ...(isDev()
      ? {
          _trace: trace.finish({
            structured: result.found,
            ai: !!aiExplanation,
            mock: aiWasMock,
          }),
        }
      : {}),
  };

  return NextResponse.json(payload);
}
