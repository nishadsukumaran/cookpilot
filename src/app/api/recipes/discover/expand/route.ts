import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import { logAiInteraction } from "@/lib/db/queries";
import type { Ingredient, CookingStep } from "@/lib/engines/types";

const DEV_USER = "dev-user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, cuisine, cookingTime } = body as {
      title: string;
      description: string;
      cuisine: string;
      cookingTime: number;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const aiResult = await ai.discoverExpand({ title, description: description ?? "", cuisine: cuisine ?? "International", cookingTime: cookingTime ?? 30 });

    logAiInteraction({
      userId: DEV_USER,
      taskType: "discover-expand",
      model: aiResult.model,
      inputSummary: title,
      inputContext: { title, cuisine, cookingTime },
      latencyMs: aiResult.latencyMs,
      wasMock: aiResult.wasMock,
    }).catch(() => {});

    let jsonStr = aiResult.content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    const raw = JSON.parse(jsonStr);

    return NextResponse.json({
      ingredients: ((raw.ingredients as Ingredient[]) ?? []).map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category ?? "other",
      })),
      steps: ((raw.steps as CookingStep[]) ?? []).map((step) => ({
        number: step.number,
        instruction: step.instruction,
        duration: step.duration,
        tip: step.tip,
      })),
    });
  } catch (error) {
    console.error("[POST /api/recipes/discover/expand]", error);
    return NextResponse.json({ error: "Failed to expand recipe" }, { status: 500 });
  }
}
