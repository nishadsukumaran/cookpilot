import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Ingredient, CookingStep } from "@/lib/engines/types";

const DEV_USER = "dev-user";

interface SaveRecipeRequest {
  sourceRecipeId?: string;
  title: string;
  description: string;
  cuisine: string;
  servings: number;
  calories: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const body: SaveRecipeRequest = await req.json();
  const { sourceRecipeId, title, description, cuisine, servings, calories, ingredients, steps } = body;

  if (!title?.trim() || !ingredients?.length || !steps?.length) {
    return NextResponse.json(
      { error: "title, ingredients, and steps are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const slug = slugify(title);

  // Insert recipe
  const [recipe] = await db
    .insert(schema.recipes)
    .values({
      slug,
      title,
      description: description ?? null,
      cuisine: cuisine ?? "International",
      cookingTime: 0,
      prepTime: 0,
      difficulty: "Medium",
      servings: servings ?? 4,
      calories: calories ?? null,
      tags: [],
      sourceRecipeId: sourceRecipeId ?? null,
      ownerId: DEV_USER,
      isUserRecipe: true,
      isPublished: false,
    })
    .returning({ id: schema.recipes.id, slug: schema.recipes.slug });

  // Insert ingredients
  if (ingredients.length > 0) {
    await db.insert(schema.recipeIngredients).values(
      ingredients.map((ing, idx) => ({
        recipeId: recipe.id,
        name: ing.name,
        amount: String(ing.amount),
        unit: ing.unit,
        category: ing.category,
        sortOrder: idx,
      })),
    );
  }

  // Insert steps
  if (steps.length > 0) {
    await db.insert(schema.recipeSteps).values(
      steps.map((step) => ({
        recipeId: recipe.id,
        stepNumber: step.number,
        instruction: step.instruction,
        duration: step.duration ?? null,
        tip: step.tip ?? null,
      })),
    );
  }

  return NextResponse.json({ id: recipe.id, slug: recipe.slug });
}

export async function GET() {
  const db = getDb();

  const recipes = await db
    .select()
    .from(schema.recipes)
    .where(
      and(
        eq(schema.recipes.ownerId, DEV_USER),
        eq(schema.recipes.isUserRecipe, true),
      ),
    )
    .orderBy(desc(schema.recipes.createdAt));

  return NextResponse.json({ recipes });
}
