/**
 * Learning & Optimization Layer — Public API
 *
 * Feedback aggregation, confidence adjustment, and personalization.
 * Wraps existing engine outputs — does not modify core logic.
 */

export { adjustConfidence } from "./confidence";
export { getFeedbackAggregation, getAllFeedbackAggregations, getScenarioMetrics } from "./feedback";
export { derivePersonalizationBias, personalizationContext } from "./personalization";
export type { FeedbackAggregation, ScenarioMetrics, ConfidenceAdjustment, PersonalizationBias } from "./types";
