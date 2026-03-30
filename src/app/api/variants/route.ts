import { NextResponse } from "next/server";
import { saveVariant, getUserVariants, getVariantsForRecipe } from "@/lib/db/queries";

const DEV_USER = "dev-user";

interface SaveVariantRequest {
  baseRecipeId: string;
  name: string;
  servings: number;
  ingredientChanges: Array<{
    ingredient: string;
    originalAmount: number;
    newAmount: number;
    unit: string;
    reason: string;
  }>;
  trustMetrics: {
    confidence: { score: number; label: string };
    risk: { level: string; reasons: string[] };
    authenticity: { score: number; label: string };
    caloriesBefore: number;
    caloriesAfter: number;
  };
  changeSummary: string;
}

export async function POST(req: Request) {
  const body: SaveVariantRequest = await req.json();

  if (!body.baseRecipeId || !body.name) {
    return NextResponse.json({ error: "baseRecipeId and name are required" }, { status: 400 });
  }

  const id = await saveVariant({
    userId: DEV_USER,
    baseRecipeId: body.baseRecipeId,
    name: body.name,
    servings: body.servings,
    ingredientChanges: body.ingredientChanges,
    trustMetrics: body.trustMetrics,
    changeSummary: body.changeSummary,
  });

  return NextResponse.json({ id });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const recipeId = url.searchParams.get("recipeId");

  const variants = recipeId
    ? await getVariantsForRecipe(DEV_USER, recipeId)
    : await getUserVariants(DEV_USER);

  return NextResponse.json({ variants });
}
