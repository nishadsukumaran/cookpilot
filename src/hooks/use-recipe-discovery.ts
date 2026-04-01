"use client";

import { useState, useCallback } from "react";
import type { SearchFilters } from "@/lib/search/filters";

function trackDiscoveryEvent(action: string, data?: Record<string, unknown>) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "discovery", action, ...data, timestamp: Date.now() }),
  }).catch(() => {});
}

// ─── Types ─────────────────────────────────────────

export interface PrimaryRecipe {
  id: string;
  title: string;
  description: string;
  why_match: string;
  cuisine: string;
  cookingTime: number;
  prepTime: number;
  difficulty: string;
  calories: number;
  servings: number;
  tags: string[];
  ingredients: { name: string; amount: number; unit: string; category: string }[];
  steps: { number: number; instruction: string; duration?: number; tip?: string }[];
  source: string;
}

export interface AlternativeRecipe {
  id: string;
  title: string;
  description: string;
  difference: string;
  cuisine: string;
  cookingTime: number;
  difficulty: string;
  calories: number;
  tags: string[];
}

export interface ExpandedData {
  ingredients: { name: string; amount: number; unit: string; category: string }[];
  steps: { number: number; instruction: string; duration?: number; tip?: string }[];
}

export type DiscoveryPhase = "idle" | "understanding" | "clarifying" | "generating" | "complete" | "error";

export interface UseRecipeDiscoveryReturn {
  // Actions
  discover: (query: string, filters?: SearchFilters) => void;
  selectClarification: (choice: string) => void;
  skipClarification: () => void;
  expandAlternative: (index: number) => void;
  reset: () => void;

  // State
  phase: DiscoveryPhase;
  query: string;

  // Phase 1 results
  intent: string | null;
  expansions: string[];
  clarification: string | null;

  // Phase 2 results
  primary: PrimaryRecipe | null;
  alternatives: AlternativeRecipe[];
  followups: string[];

  // Alternative expansion
  expandedAlternatives: Map<number, ExpandedData>;
  expandingIndex: number | null;

  // Error
  error: string | null;
}

export function useRecipeDiscovery(): UseRecipeDiscoveryReturn {
  const [phase, setPhase] = useState<DiscoveryPhase>("idle");
  const [query, setQuery] = useState("");

  // Phase 1
  const [intent, setIntent] = useState<string | null>(null);
  const [expansions, setExpansions] = useState<string[]>([]);
  const [clarification, setClarification] = useState<string | null>(null);

  // Phase 2
  const [primary, setPrimary] = useState<PrimaryRecipe | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeRecipe[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);

  // Expansion
  const [expandedAlternatives, setExpandedAlternatives] = useState<Map<number, ExpandedData>>(new Map());
  const [expandingIndex, setExpandingIndex] = useState<number | null>(null);

  // Error
  const [error, setError] = useState<string | null>(null);

  // Stored filters for phase 2
  const [storedFilters, setStoredFilters] = useState<SearchFilters | undefined>();

  const runPhase2 = useCallback(async (q: string, resolved: string | null, filters?: SearchFilters) => {
    setPhase("generating");
    try {
      const res = await fetch("/api/recipes/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          phase: "generate",
          resolvedIntent: resolved,
          filters,
        }),
      });
      if (!res.ok) throw new Error("Generate failed");
      const data = await res.json();

      if (data.error || !data.primary) {
        setError(data.error ?? "No recipes found");
        setPhase("error");
        return;
      }

      setPrimary(data.primary);
      setAlternatives(data.alternatives ?? []);
      setFollowups(data.followups ?? []);
      setPhase("complete");
      trackDiscoveryEvent("generate_complete", { query: q, primaryTitle: data.primary?.title, alternativeCount: data.alternatives?.length ?? 0 });
    } catch {
      trackDiscoveryEvent("error", { query: q, phase: "generate" });
      setError("Failed to generate recipes. Try again.");
      setPhase("error");
    }
  }, []);

  const discover = useCallback((q: string, filters?: SearchFilters) => {
    // Reset state
    setQuery(q);
    setIntent(null);
    setExpansions([]);
    setClarification(null);
    setPrimary(null);
    setAlternatives([]);
    setFollowups([]);
    setExpandedAlternatives(new Map());
    setExpandingIndex(null);
    setError(null);
    setStoredFilters(filters);
    setPhase("understanding");
    trackDiscoveryEvent("understand_start", { query: q });

    // Phase 1
    fetch("/api/recipes/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, phase: "understand", filters }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Understand failed");
        return res.json();
      })
      .then((data) => {
        setIntent(data.intent ?? "dish_search");
        setExpansions(data.expansions ?? []);

        if (data.needsClarification && data.clarification) {
          trackDiscoveryEvent("clarification_shown", { query: q, intent: data.intent });
          setClarification(data.clarification);
          setPhase("clarifying");
        } else {
          trackDiscoveryEvent("auto_generate", { query: q, intent: data.intent });
          // Auto-proceed to phase 2
          runPhase2(q, null, filters);
        }
      })
      .catch(() => {
        trackDiscoveryEvent("error", { query: q, phase: "understand" });
        setError("Failed to understand query. Try again.");
        setPhase("error");
      });
  }, [runPhase2]);

  const selectClarification = useCallback((choice: string) => {
    trackDiscoveryEvent("clarification_selected", { query, choice });
    runPhase2(query, choice, storedFilters);
  }, [query, storedFilters, runPhase2]);

  const skipClarification = useCallback(() => {
    trackDiscoveryEvent("clarification_skipped", { query });
    runPhase2(query, null, storedFilters);
  }, [query, storedFilters, runPhase2]);

  const expandAlternative = useCallback(async (index: number) => {
    if (expandedAlternatives.has(index) || expandingIndex !== null) return;
    const alt = alternatives[index];
    if (!alt) return;

    setExpandingIndex(index);
    try {
      const res = await fetch("/api/recipes/discover/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: alt.title,
          description: alt.description,
          cuisine: alt.cuisine,
          cookingTime: alt.cookingTime,
          difference: alt.difference,
          difficulty: alt.difficulty,
          calories: alt.calories,
        }),
      });
      if (!res.ok) throw new Error("Expand failed");
      const data = await res.json();

      trackDiscoveryEvent("alternative_expanded", { title: alt.title, index });
      setExpandedAlternatives((prev) => {
        const next = new Map(prev);
        next.set(index, {
          ingredients: data.ingredients ?? [],
          steps: data.steps ?? [],
        });
        return next;
      });
    } catch {
      // Silently fail — user can retry
    } finally {
      setExpandingIndex(null);
    }
  }, [alternatives, expandedAlternatives, expandingIndex]);

  const reset = useCallback(() => {
    setPhase("idle");
    setQuery("");
    setIntent(null);
    setExpansions([]);
    setClarification(null);
    setPrimary(null);
    setAlternatives([]);
    setFollowups([]);
    setExpandedAlternatives(new Map());
    setExpandingIndex(null);
    setError(null);
    setStoredFilters(undefined);
  }, []);

  return {
    discover, selectClarification, skipClarification, expandAlternative, reset,
    phase, query,
    intent, expansions, clarification,
    primary, alternatives, followups,
    expandedAlternatives, expandingIndex,
    error,
  };
}
