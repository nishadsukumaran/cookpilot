import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import { logAiInteraction } from "@/lib/db/queries";
import { createTrace, isDev } from "@/lib/debug/types";
import type { SearchFilters } from "@/lib/search/filters";
import type { Ingredient, CookingStep } from "@/lib/engines/types";

const DEV_USER = "dev-user";

interface DiscoverRequest {
  query: string;
  phase: "understand" | "generate";
  preferences?: {
    spicePreference?: string;
    dietary?: string[];
    cuisines?: string[];
  };
  filters?: SearchFilters;
  resolvedIntent?: string | null;
}

export async function POST(req: Request) {
  try {
    const body: DiscoverRequest = await req.json();
    const { query, phase, preferences, filters, resolvedIntent } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    if (phase === "understand") {
      return handleUnderstand(query, preferences, filters);
    } else if (phase === "generate") {
      return handleGenerate(query, resolvedIntent ?? null, preferences, filters);
    } else {
      return NextResponse.json({ error: "phase must be 'understand' or 'generate'" }, { status: 400 });
    }
  } catch (error) {
    console.error("[POST /api/recipes/discover]", error);
    return NextResponse.json({ error: "Discovery failed" }, { status: 500 });
  }
}

async function handleUnderstand(
  query: string,
  preferences?: DiscoverRequest["preferences"],
  filters?: SearchFilters,
) {
  const aiResult = await ai.discoverUnderstand({ query, preferences, filters });

  logAiInteraction({
    userId: DEV_USER,
    taskType: "discover-understand",
    model: aiResult.model,
    inputSummary: query,
    inputContext: { query, preferences, filters },
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
  }).catch(() => {});

  // Parse JSON response
  let parsed: { intent: string; expansions: string[]; needsClarification: boolean; clarification: string | null };
  try {
    let jsonStr = aiResult.content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    // Fallback if AI returns unparseable response
    parsed = {
      intent: "dish_search",
      expansions: [query],
      needsClarification: false,
      clarification: null,
    };
  }

  const trace = createTrace();
  trace.addStage("ai-call", `discover-understand`, aiResult.latencyMs, {
    model: aiResult.model,
    wasMock: aiResult.wasMock,
    intent: parsed.intent,
    expansionCount: parsed.expansions?.length ?? 0,
    needsClarification: parsed.needsClarification,
  });

  return NextResponse.json({
    phase: "understand",
    intent: parsed.intent ?? "dish_search",
    expansions: parsed.expansions ?? [query],
    needsClarification: parsed.needsClarification ?? false,
    clarification: parsed.clarification ?? null,
    ...(isDev() ? { _trace: trace.finish({ structured: false, ai: true, mock: aiResult.wasMock }) } : {}),
  });
}

async function handleGenerate(
  query: string,
  resolvedIntent: string | null,
  preferences?: DiscoverRequest["preferences"],
  filters?: SearchFilters,
) {
  const aiResult = await ai.discoverGenerate({ query, resolvedIntent, preferences, filters });

  logAiInteraction({
    userId: DEV_USER,
    taskType: "discover-generate",
    model: aiResult.model,
    inputSummary: resolvedIntent ?? query,
    inputContext: { query, resolvedIntent, preferences, filters },
    latencyMs: aiResult.latencyMs,
    wasMock: aiResult.wasMock,
  }).catch(() => {});

  // Parse JSON response
  try {
    let jsonStr = aiResult.content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const raw = JSON.parse(jsonStr);

    // Shape the primary recipe
    const primary = raw.primary ? {
      id: crypto.randomUUID(),
      title: raw.primary.title ?? "Untitled Recipe",
      description: raw.primary.description ?? "",
      why_match: raw.primary.why_match ?? "",
      cuisine: raw.primary.cuisine ?? "International",
      cookingTime: raw.primary.cookingTime ?? 30,
      prepTime: raw.primary.prepTime ?? 15,
      difficulty: raw.primary.difficulty ?? "Medium",
      calories: raw.primary.calories ?? 0,
      servings: raw.primary.servings ?? 4,
      tags: raw.primary.tags ?? [],
      ingredients: ((raw.primary.ingredients as Ingredient[]) ?? []).map((ing) => ({
        name: String(ing.name ?? "").trim(),
        amount: Number(ing.amount) || 1,
        unit: String(ing.unit ?? ""),
        category: ing.category ?? "other",
      })),
      steps: ((raw.primary.steps as CookingStep[]) ?? []).map((step, idx) => ({
        number: Number(step.number) || idx + 1,
        instruction: String(step.instruction ?? ""),
        duration: step.duration != null ? (Number(step.duration) || undefined) : undefined,
        tip: step.tip ? String(step.tip) : undefined,
      })),
      source: "ai-generated" as const,
    } : null;

    // Shape alternatives (lightweight — no ingredients/steps)
    const alternatives = (raw.alternatives ?? []).map((alt: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      title: (alt.title as string) ?? "Alternative",
      description: (alt.description as string) ?? "",
      difference: (alt.difference as string) ?? "",
      cuisine: (alt.cuisine as string) ?? "International",
      cookingTime: (alt.cookingTime as number) ?? 30,
      difficulty: (alt.difficulty as string) ?? "Medium",
      calories: (alt.calories as number) ?? 0,
      tags: (alt.tags as string[]) ?? [],
    }));

    const followups = (raw.followups as string[]) ?? [
      "Make it less spicy",
      "Show a healthier version",
      "Start cooking",
    ];

    // Validate primary has usable content
    if (primary && (primary.ingredients.length === 0 || primary.steps.length === 0)) {
      console.error("[discover-generate] Primary recipe has no ingredients or steps");
      return NextResponse.json({
        phase: "generate",
        intent: resolvedIntent ?? query,
        primary: null,
        alternatives: [],
        followups: [],
        error: "AI generated an incomplete recipe. Please try again.",
      });
    }

    const trace = createTrace();
    trace.addStage("ai-call", `discover-generate`, aiResult.latencyMs, {
      model: aiResult.model,
      wasMock: aiResult.wasMock,
      hasIngredients: primary?.ingredients?.length ?? 0,
      hasSteps: primary?.steps?.length ?? 0,
      alternativeCount: alternatives.length,
    });

    return NextResponse.json({
      phase: "generate",
      intent: resolvedIntent ?? query,
      primary,
      alternatives,
      followups,
      ...(isDev() ? { _trace: trace.finish({ structured: false, ai: true, mock: aiResult.wasMock }) } : {}),
    });
  } catch (error) {
    console.error("[discover-generate] JSON parse failed:", error, "Raw:", aiResult.content.slice(0, 500));
    return NextResponse.json({
      phase: "generate",
      intent: resolvedIntent ?? query,
      primary: null,
      alternatives: [],
      followups: [],
      error: "Failed to parse AI response",
    });
  }
}
