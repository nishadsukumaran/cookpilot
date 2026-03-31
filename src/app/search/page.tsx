"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  ChefHat,
  Loader2,
  BookOpen,
  Globe,
} from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { FilterBar } from "@/components/search/filter-bar";
import { RecipeDiscoveryCard } from "@/components/recipe/recipe-discovery-card";
import { AiRecipeCard } from "@/components/search/ai-recipe-card";
import { ImportPreviewSheet } from "@/components/recipe/import-preview-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipeSearch } from "@/hooks/use-recipe-search";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const {
    query,
    setQuery,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    localRecipes,
    localLoading,
    aiCandidates,
    aiLoading,
    aiSearched,
    triggerAiSearch,
    previewCandidate,
    setPreviewCandidate,
  } = useRecipeSearch(initialQuery);

  const hasQuery = query.trim().length > 0 || hasActiveFilters;
  const showLocalResults = localRecipes.length > 0;
  const showAiSection = hasQuery || aiSearched;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Sticky search header ───────────────────── */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            autoFocus={!initialQuery}
            placeholder="Try 'pasta carbonara' or 'healthy dinner'..."
          />
        </div>

        <div className="mx-auto max-w-lg px-4 pb-3">
          <FilterBar
            filters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* ─── Results area ───────────────────────────── */}
      <div className="mx-auto max-w-lg px-4 pb-24">

        {/* Tier 1: Local DB results */}
        <section className="mt-5">
          {localLoading ? (
            <div className="space-y-4">
              <RecipeSkeleton />
              <RecipeSkeleton />
            </div>
          ) : showLocalResults ? (
            <motion.div
              key={`local-${query}-${JSON.stringify(filters)}`}
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">
                    In your collection
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({localRecipes.length})
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Recipes you&apos;ve saved or imported
                  </p>
                </div>
              </motion.div>

              <div className="space-y-4">
                {localRecipes.map((recipe, i) => (
                  <motion.div key={recipe.id} variants={fadeUp}>
                    <RecipeDiscoveryCard recipe={recipe} rank={i + 1} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : hasQuery && !localLoading ? (
            <div className="mt-2 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
              <Search className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No recipes in your collection match this search
              </p>
            </div>
          ) : null}
        </section>

        {/* Tier 2: AI Discovery */}
        {showAiSection && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Discover new recipes</h2>
                <p className="text-xs text-muted-foreground">
                  AI-generated recipes you can preview and import
                </p>
              </div>
            </div>

            {!aiSearched && !aiLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={triggerAiSearch}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5 px-4 py-4 text-left transition-colors hover:bg-purple-500/10 hover:border-purple-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Discover with AI
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {query.trim()
                        ? `Find "${query}" recipes from AI`
                        : "Get personalized recipe suggestions"}
                    </p>
                  </div>
                  <ChefHat className="h-5 w-5 text-purple-500/50 transition-transform group-hover:scale-110" />
                </button>
              </motion.div>
            )}

            {aiLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  <span className="text-sm text-muted-foreground">
                    CookGenie AI is finding recipes...
                  </span>
                </div>
              </div>
            )}

            {aiSearched && !aiLoading && aiCandidates.length > 0 && (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {aiCandidates.map((candidate) => (
                  <motion.div key={candidate.id} variants={fadeUp}>
                    <AiRecipeCard
                      candidate={candidate}
                      onClick={() => setPreviewCandidate(candidate)}
                    />
                  </motion.div>
                ))}

                {/* Search again button */}
                <motion.div variants={fadeUp} className="pt-1">
                  <button
                    onClick={triggerAiSearch}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate more recipes
                  </button>
                </motion.div>
              </motion.div>
            )}

            {aiSearched && !aiLoading && aiCandidates.length === 0 && (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="No AI results"
                description="AI couldn't generate matching recipes. Try adjusting your search or filters."
                action={
                  <button
                    onClick={triggerAiSearch}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Try again
                  </button>
                }
              />
            )}
          </section>
        )}

        {/* ─── Discovery prompts (no query state) ──── */}
        {!hasQuery && !localLoading && (
          <section className="mt-8 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Explore ideas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🍛", label: "Indian Classics", query: "Indian" },
                { icon: "🥗", label: "Healthy Bowls", query: "Healthy" },
                { icon: "⚡", label: "Under 30 min", query: "Quick Meals" },
                { icon: "🌱", label: "Vegetarian", query: "Vegetarian" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuery(item.query)}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-card transition-all hover:shadow-card-hover hover:border-primary/20"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── Import Preview Sheet ───────────────────── */}
      <ImportPreviewSheet
        candidate={previewCandidate}
        open={previewCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewCandidate(null);
        }}
        onImported={(data) => {
          setPreviewCandidate(null);
          router.push(`/recipe/${data.slug}`);
        }}
      />
    </div>
  );
}

function RecipeSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
