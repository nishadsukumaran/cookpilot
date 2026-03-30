import { NextResponse } from "next/server";
import { submitFeedback } from "@/lib/db/queries";

const DEV_USER = "dev-user";

interface FeedbackRequest {
  targetType: "rescue" | "substitution" | "modification";
  targetId?: string;
  rating: "helpful" | "not_helpful" | "too_risky" | "too_different";
  notes?: string;
}

export async function POST(req: Request) {
  const body: FeedbackRequest = await req.json();

  if (!body.targetType || !body.rating) {
    return NextResponse.json({ error: "targetType and rating are required" }, { status: 400 });
  }

  const id = await submitFeedback({
    userId: DEV_USER,
    targetType: body.targetType,
    targetId: body.targetId,
    rating: body.rating,
    notes: body.notes,
  });

  return NextResponse.json({ id });
}
