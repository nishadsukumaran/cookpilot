/**
 * Mock structured responses for each model tier.
 *
 * These simulate what real AI models would return via the
 * AI Gateway with structured output (Output.object()).
 */

import type { StructuredAdvice } from "./types";
import type { ArbitrationContext } from "./index";

// ─── Mock: Primary Model ────────────────────────────

export function mockPrimaryAdvice(ctx: ArbitrationContext): StructuredAdvice {
  if (ctx.rescueProblem === "too-salty") {
    return {
      scenario_type: "rescue",
      primary_fix: {
        action: "Add acid to counteract the salt. Squeeze fresh lemon juice (1-2 tsp) or a splash of white vinegar into the dish. Stir well and taste after 30 seconds.",
        ingredients: [
          { name: "Lemon juice", amount: "1-2 tsp" },
          { name: "White vinegar", amount: "1 tsp (alternative)" },
        ],
        urgency: "immediate",
      },
      alternatives: [
        {
          action: "Add unsalted bulk: cream, yogurt, or coconut milk to dilute the salt",
          tradeoff: "Changes the consistency slightly but very effective for curries",
        },
        {
          action: "Simmer a peeled raw potato for 10 minutes, then remove it",
          tradeoff: "Classic technique, works best for soups and stews",
        },
      ],
      impact_on_taste: {
        score: 4,
        direction: "better",
        note: "Acid balances salt perception without masking other flavors",
      },
      impact_on_texture: {
        score: 5,
        direction: "neutral",
        note: "Minimal texture impact from a small amount of acid",
      },
      authenticity_impact: {
        score: 5,
        direction: "neutral",
        note: "Adding acid is a standard correction in all cuisines",
      },
      confidence: 0.88,
      notes: "High confidence — over-salting is a well-understood problem with proven fixes. Acid is the fastest and most reliable correction.",
    };
  }

  // Default mock for other scenarios
  return {
    scenario_type: ctx.rescueProblem ? "rescue" : "general",
    primary_fix: {
      action: `Address the issue step by step. Start with small adjustments and taste between each change.`,
      ingredients: [],
      urgency: "when_ready",
    },
    alternatives: [],
    impact_on_taste: { score: 3, direction: "neutral", note: "Varies by specific situation" },
    impact_on_texture: { score: 4, direction: "neutral", note: "Minimal expected change" },
    authenticity_impact: { score: 4, direction: "neutral", note: "Standard cooking correction" },
    confidence: 0.55,
    notes: "Moderate confidence — general advice without specific scenario knowledge.",
  };
}

// ─── Mock: Validator Model ──────────────────────────

export function mockValidatorAdvice(ctx: ArbitrationContext): StructuredAdvice {
  if (ctx.rescueProblem === "too-salty") {
    return {
      scenario_type: "rescue",
      primary_fix: {
        action: "Introduce an acidic element to offset the excess sodium. Fresh citrus juice works best — lemon or lime. Add gradually (1 tsp at a time) and taste.",
        ingredients: [
          { name: "Fresh lemon or lime juice", amount: "1-2 tsp" },
        ],
        urgency: "immediate",
      },
      alternatives: [
        {
          action: "Increase the volume of the dish with unsalted ingredients — more tomato puree, cream, or broth",
          tradeoff: "Dilutes salt but also dilutes other flavors slightly; re-season non-salt spices",
        },
        {
          action: "A pinch of sugar can suppress salt perception on the palate",
          tradeoff: "Subtle effect, works best in combination with acid",
        },
      ],
      impact_on_taste: {
        score: 4,
        direction: "better",
        note: "Citric acid directly counteracts sodium perception on taste buds",
      },
      impact_on_texture: {
        score: 5,
        direction: "neutral",
        note: "No texture impact at these quantities",
      },
      authenticity_impact: {
        score: 5,
        direction: "neutral",
        note: "Corrective technique used universally across cuisines",
      },
      confidence: 0.85,
      notes: "High confidence — validated correction. Both acid and dilution are proven. Acid is faster; dilution is more thorough for extreme cases.",
    };
  }

  return {
    scenario_type: ctx.rescueProblem ? "rescue" : "general",
    primary_fix: {
      action: "Make incremental adjustments. Taste frequently. Don't try to fix everything in one step.",
      ingredients: [],
      urgency: "when_ready",
    },
    alternatives: [],
    impact_on_taste: { score: 3, direction: "neutral", note: "Context-dependent" },
    impact_on_texture: { score: 4, direction: "neutral", note: "Likely minimal change" },
    authenticity_impact: { score: 4, direction: "neutral", note: "Standard technique" },
    confidence: 0.50,
    notes: "Moderate confidence — would need more context for specific advice.",
  };
}

// ─── Mock: Arbitrator Model ─────────────────────────

export function mockArbitratorAdvice(
  ctx: ArbitrationContext,
  priorResponses?: {
    primaryAdvice: StructuredAdvice;
    validatorAdvice: StructuredAdvice;
    mismatches: string[];
  }
): StructuredAdvice {
  if (ctx.rescueProblem === "too-salty") {
    return {
      scenario_type: "rescue",
      primary_fix: {
        action: "Add 1-2 tsp of fresh lemon juice and stir well. Both previous models agree on this as the fastest fix. The acid directly counteracts salt perception without changing the dish's character.",
        ingredients: [
          { name: "Fresh lemon juice", amount: "1-2 tsp" },
          { name: "Sugar (optional booster)", amount: "1 small pinch" },
        ],
        urgency: "immediate",
      },
      alternatives: [
        {
          action: "Dilute with unsalted cream, yogurt, or coconut milk (2-3 tbsp)",
          tradeoff: "More thorough for extreme over-salting but changes consistency. Re-season other spices after.",
        },
        {
          action: "Simmer a peeled potato for 10 min (soups/stews only)",
          tradeoff: "Traditional technique, only works for liquid-heavy dishes",
        },
      ],
      impact_on_taste: {
        score: 4,
        direction: "better",
        note: "Consensus: acid is the most effective taste correction for over-salting",
      },
      impact_on_texture: {
        score: 5,
        direction: "neutral",
        note: "Both models agree: negligible texture impact",
      },
      authenticity_impact: {
        score: 5,
        direction: "neutral",
        note: "Universal corrective technique — no authenticity concern",
      },
      confidence: 0.92,
      notes: `Arbitration ruling: both models agree on the core fix (acid/lemon). ${
        priorResponses?.mismatches.length
          ? `Resolved mismatches: ${priorResponses.mismatches.join("; ")}`
          : "Minor wording differences only — no material disagreement."
      }`,
    };
  }

  // Default: pick the higher-confidence prior response if available
  if (priorResponses) {
    const better =
      priorResponses.primaryAdvice.confidence >= priorResponses.validatorAdvice.confidence
        ? priorResponses.primaryAdvice
        : priorResponses.validatorAdvice;
    return {
      ...better,
      confidence: Math.min(0.9, better.confidence + 0.1),
      notes: `Arbitration: selected higher-confidence response. ${better.notes}`,
    };
  }

  return mockPrimaryAdvice(ctx);
}
