/**
 * Knowledge guardrail layer.
 *
 * Final deterministic safety check that validates AI output
 * against the structured cooking knowledge base. Catches
 * dangerous contradictions that would make a dish worse.
 */

import type { StructuredAdvice } from "./types";
import type { RescueProblem } from "../../engines/types";
import { findRescueSolution } from "../../engines/rescue/rescue-db";

export interface GuardrailResult {
  passed: boolean;
  corrections: GuardrailCorrection[];
  correctedAdvice: StructuredAdvice;
}

export interface GuardrailCorrection {
  field: string;
  issue: string;
  correction: string;
  severity: "warning" | "override";
}

/**
 * Validate and potentially correct AI advice against knowledge base.
 */
export function applyGuardrail(
  advice: StructuredAdvice,
  context: { rescueProblem?: RescueProblem }
): GuardrailResult {
  const corrections: GuardrailCorrection[] = [];
  let corrected = structuredClone(advice);

  if (context.rescueProblem) {
    const knowledgeCorrections = validateAgainstRescueDB(
      corrected,
      context.rescueProblem
    );
    corrections.push(...knowledgeCorrections.corrections);
    corrected = knowledgeCorrections.corrected;
  }

  // Validate confidence is reasonable
  const confCorrection = validateConfidence(corrected);
  if (confCorrection) {
    corrections.push(confCorrection);
  }

  // Validate urgency matches scenario severity
  if (context.rescueProblem) {
    const urgencyCorrection = validateUrgency(corrected, context.rescueProblem);
    if (urgencyCorrection) {
      corrections.push(urgencyCorrection);
      corrected.primary_fix.urgency = urgencyCorrection.field === "urgency_upgrade"
        ? "immediate"
        : corrected.primary_fix.urgency;
    }
  }

  return {
    passed: corrections.filter((c) => c.severity === "override").length === 0,
    corrections,
    correctedAdvice: corrected,
  };
}

// ─── Validation Rules ───────────────────────────────

function validateAgainstRescueDB(
  advice: StructuredAdvice,
  problem: RescueProblem
): { corrections: GuardrailCorrection[]; corrected: StructuredAdvice } {
  const corrections: GuardrailCorrection[] = [];
  const corrected = structuredClone(advice);
  const solution = findRescueSolution(problem);
  if (!solution) return { corrections, corrected };

  const action = advice.primary_fix.action.toLowerCase();

  // Dangerous contradiction checks
  const dangerousActions: Record<string, { patterns: string[]; correction: string }> = {
    "too-salty": {
      patterns: ["add salt", "add more salt", "extra salt", "season with salt"],
      correction: "Add acid (lemon juice) or dilute with unsalted ingredients to counteract excess salt.",
    },
    "too-spicy": {
      patterns: ["add chili", "more spice", "add cayenne", "increase heat"],
      correction: "Add dairy (yogurt, cream) or sugar to mellow the heat. Dilute with more base ingredients.",
    },
    "too-sweet": {
      patterns: ["add sugar", "more sweetener", "add honey"],
      correction: "Add acid (lemon juice, vinegar) or salt to balance excessive sweetness.",
    },
    "slightly-burned": {
      patterns: ["continue cooking", "keep heating", "raise temperature", "cook longer"],
      correction: "Immediately transfer unburned portion to a clean pot. Do not continue cooking in the same vessel.",
    },
    "too-watery": {
      patterns: ["add more water", "add liquid", "thin it out"],
      correction: "Reduce by simmering with lid off, or thicken with cornstarch slurry or cashew paste.",
    },
    "too-thick": {
      patterns: ["thicken further", "add flour", "reduce more", "cook down"],
      correction: "Add warm liquid (broth, milk, or water) a few tablespoons at a time.",
    },
    "bland": {
      patterns: ["reduce seasoning", "remove spice", "less salt"],
      correction: "Build flavor with salt first, then acid, then umami. Toast spices to bloom their oils.",
    },
  };

  const check = dangerousActions[problem];
  if (check) {
    for (const pattern of check.patterns) {
      if (action.includes(pattern)) {
        corrections.push({
          field: "primary_fix.action",
          issue: `AI recommended "${pattern}" which worsens the "${solution.label}" problem`,
          correction: check.correction,
          severity: "override",
        });

        // Override with the safe correction
        corrected.primary_fix.action = check.correction;
        corrected.confidence = Math.min(corrected.confidence, 0.5);
        corrected.notes += " [Guardrail: original advice contradicted cooking knowledge and was corrected]";
        break;
      }
    }
  }

  return { corrections, corrected };
}

function validateConfidence(advice: StructuredAdvice): GuardrailCorrection | null {
  // AI claiming 100% confidence is suspicious
  if (advice.confidence > 0.95) {
    return {
      field: "confidence",
      issue: "Unrealistically high confidence",
      correction: "Capped at 0.9 — no cooking advice is 100% certain",
      severity: "warning",
    };
  }
  return null;
}

function validateUrgency(
  advice: StructuredAdvice,
  problem: RescueProblem
): GuardrailCorrection | null {
  // Burned food should always be immediate urgency
  if (problem === "slightly-burned" && advice.primary_fix.urgency !== "immediate") {
    return {
      field: "urgency_upgrade",
      issue: "Burn rescue marked as non-urgent",
      correction: "Burn recovery must be immediate — delay allows burnt flavor to spread",
      severity: "override",
    };
  }
  return null;
}
