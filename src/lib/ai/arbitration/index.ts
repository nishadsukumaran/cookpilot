/**
 * Multi-Model Arbitration Pipeline
 *
 * Orchestrates the primary → validation → arbitration → guardrail
 * flow. Invokes additional models only when deterministic triggers fire.
 *
 * Usage:
 *   import { arbitrate } from "@/lib/ai/arbitration";
 *   const result = await arbitrate("too-salty", userInput, context);
 */

import type {
  StructuredAdvice,
  TieredResponse,
  ArbitrationResult,
  ModelTier,
} from "./types";
import type { RescueProblem } from "../../engines/types";
import { shouldValidate, shouldArbitrate } from "./triggers";
import { detectMismatch } from "./mismatch";
import { applyGuardrail } from "./guardrail";
import { shouldUseMock, getModel } from "../gateway";
import {
  mockPrimaryAdvice,
  mockValidatorAdvice,
  mockArbitratorAdvice,
} from "./mock-responses";

// ─── Public API ─────────────────────────────────────

export interface ArbitrationContext {
  userInput: string;
  rescueProblem?: RescueProblem;
  recipeName?: string;
  cuisine?: string;
  currentStep?: number;
  hasStructuredKnowledge: boolean;
}

/**
 * Run the full arbitration pipeline for a query.
 *
 * Always returns a result — the pipeline is progressive:
 * - Tier 1 (primary) always runs
 * - Tier 2 (validator) runs only when triggers fire
 * - Tier 3 (arbitrator) runs only on material disagreement
 * - Guardrail always runs on the final output
 */
export async function arbitrate(
  ctx: ArbitrationContext
): Promise<ArbitrationResult> {
  const responses: TieredResponse[] = [];

  // ─── Tier 1: Primary ──────────────────────────────
  const primaryStart = Date.now();
  const primaryAdvice = await getStructuredAdvice("primary", ctx);
  responses.push({
    advice: primaryAdvice,
    tier: "primary",
    model: getModel("primary"),
    latencyMs: Date.now() - primaryStart,
  });

  // ─── Check: Should validate? ──────────────────────
  const triggerResult = shouldValidate(primaryAdvice, {
    scenarioType: primaryAdvice.scenario_type,
    rescueProblem: ctx.rescueProblem,
    hasStructuredKnowledge: ctx.hasStructuredKnowledge,
  });

  if (!triggerResult.shouldValidate) {
    // No validation needed — apply guardrail and return
    const guardrail = applyGuardrail(primaryAdvice, {
      rescueProblem: ctx.rescueProblem,
    });

    return {
      final: guardrail.correctedAdvice,
      tiersUsed: 1,
      validationTriggered: false,
      validationReasons: [],
      arbitrationTriggered: false,
      guardrailApplied: guardrail.corrections.length > 0,
      guardrailCorrections: guardrail.corrections.map((c) => c.issue),
      responses,
    };
  }

  // ─── Tier 2: Validator ────────────────────────────
  const validatorStart = Date.now();
  const validatorAdvice = await getStructuredAdvice("validator", ctx);
  responses.push({
    advice: validatorAdvice,
    tier: "validator",
    model: getModel("validator"),
    latencyMs: Date.now() - validatorStart,
  });

  // ─── Check: Material mismatch? ────────────────────
  const mismatch = detectMismatch(primaryAdvice, validatorAdvice);

  const arbitrationCheck = shouldArbitrate(
    primaryAdvice,
    validatorAdvice,
    mismatch.hasMaterialMismatch
  );

  if (!arbitrationCheck.shouldArbitrate) {
    // No arbitration needed — merge and return highest-confidence
    const merged = mergeResponses(primaryAdvice, validatorAdvice);
    const guardrail = applyGuardrail(merged, {
      rescueProblem: ctx.rescueProblem,
    });

    return {
      final: guardrail.correctedAdvice,
      tiersUsed: 2,
      validationTriggered: true,
      validationReasons: triggerResult.reasons,
      arbitrationTriggered: false,
      guardrailApplied: guardrail.corrections.length > 0,
      guardrailCorrections: guardrail.corrections.map((c) => c.issue),
      responses,
    };
  }

  // ─── Tier 3: Arbitrator ───────────────────────────
  const arbitratorStart = Date.now();
  const arbitratorAdvice = await getStructuredAdvice("arbitrator", ctx, {
    primaryAdvice,
    validatorAdvice,
    mismatches: mismatch.mismatches.map((m) => m.explanation),
  });
  responses.push({
    advice: arbitratorAdvice,
    tier: "arbitrator",
    model: getModel("arbitrator"),
    latencyMs: Date.now() - arbitratorStart,
  });

  // ─── Guardrail on final ───────────────────────────
  const guardrail = applyGuardrail(arbitratorAdvice, {
    rescueProblem: ctx.rescueProblem,
  });

  return {
    final: guardrail.correctedAdvice,
    tiersUsed: 3,
    validationTriggered: true,
    validationReasons: triggerResult.reasons,
    arbitrationTriggered: true,
    arbitrationReason: arbitrationCheck.reason,
    guardrailApplied: guardrail.corrections.length > 0,
    guardrailCorrections: guardrail.corrections.map((c) => c.issue),
    responses,
  };
}

// ─── Model Invocation ───────────────────────────────

async function getStructuredAdvice(
  tier: ModelTier,
  ctx: ArbitrationContext,
  priorResponses?: {
    primaryAdvice: StructuredAdvice;
    validatorAdvice: StructuredAdvice;
    mismatches: string[];
  }
): Promise<StructuredAdvice> {
  // In mock mode, return deterministic mock responses
  if (shouldUseMock()) {
    switch (tier) {
      case "primary":
        return mockPrimaryAdvice(ctx);
      case "validator":
        return mockValidatorAdvice(ctx);
      case "arbitrator":
        return mockArbitratorAdvice(ctx, priorResponses);
      default:
        return mockPrimaryAdvice(ctx);
    }
  }

  // TODO: Real AI Gateway calls with structured output
  // const result = await generateText({
  //   model: getModel(tier),
  //   output: Output.object({ schema: structuredAdviceSchema }),
  //   system: buildSystemPrompt(tier, ctx, priorResponses),
  //   prompt: ctx.userInput,
  // });
  // return result.object;

  return mockPrimaryAdvice(ctx);
}

// ─── Merge Logic ────────────────────────────────────

/**
 * Merge two agreeing responses by picking the higher-confidence
 * fields from each and averaging scores.
 */
function mergeResponses(
  primary: StructuredAdvice,
  validator: StructuredAdvice
): StructuredAdvice {
  const pick = primary.confidence >= validator.confidence ? primary : validator;
  const other = pick === primary ? validator : primary;

  return {
    ...pick,
    // Average the impact scores for more balanced assessment
    impact_on_taste: {
      ...pick.impact_on_taste,
      score: Math.round((primary.impact_on_taste.score + validator.impact_on_taste.score) / 2),
    },
    impact_on_texture: {
      ...pick.impact_on_texture,
      score: Math.round((primary.impact_on_texture.score + validator.impact_on_texture.score) / 2),
    },
    authenticity_impact: {
      ...pick.authenticity_impact,
      score: Math.round((primary.authenticity_impact.score + validator.authenticity_impact.score) / 2),
    },
    // Boost confidence when two models agree
    confidence: Math.min(
      0.95,
      (primary.confidence + validator.confidence) / 2 + 0.1
    ),
    // Combine notes
    notes: `${pick.notes} | Validated by second model: ${other.notes}`,
  };
}

// ─── Re-exports ─────────────────────────────────────

export type { ArbitrationResult, StructuredAdvice, TieredResponse } from "./types";
export { detectMismatch } from "./mismatch";
export { shouldValidate, shouldArbitrate } from "./triggers";
export { applyGuardrail } from "./guardrail";
