import { NextResponse } from "next/server";
import { getPreferences, upsertPreferences } from "@/lib/db/queries";

const DEV_USER = "dev-user";

export async function GET() {
  const prefs = await getPreferences(DEV_USER);
  return NextResponse.json({ preferences: prefs });
}

export async function POST(req: Request) {
  const body = await req.json();

  const id = await upsertPreferences(DEV_USER, {
    spicePreference: body.spicePreference,
    dietary: body.dietary,
    cuisines: body.cuisines,
    calorieGoal: body.calorieGoal,
    authenticityPreference: body.authenticityPreference,
    unitSystem: body.unitSystem,
  });

  return NextResponse.json({ id });
}
