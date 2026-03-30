"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditResult } from "@/lib/engines/recipe-edit/types";

type ActiveAction = "replace" | "remove" | "explain" | null;

interface IngredientActionMenuProps {
  ingredientName: string;
  recipeId: string;
  onEditComplete?: (result: EditResult) => void;
}

export function IngredientActionMenu({
  ingredientName,
  recipeId,
  onEditComplete,
}: IngredientActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [replacementName, setReplacementName] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setActiveAction(null);
    setReplacementName("");
    setExplanation(null);
    setError(null);
    setLoading(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) reset();
  }

  async function callEditApi(
    actionType: "replace" | "remove",
    extra?: Record<string, unknown>
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipe-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          action: {
            type: actionType,
            ingredientName,
            ...extra,
          },
        }),
      });
      if (!res.ok) throw new Error("Edit failed");
      const result: EditResult = await res.json();
      onEditComplete?.(result);
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchExplanation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipe-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          action: {
            type: "remove",
            ingredientName,
          },
          dryRun: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch explanation");
      const result: EditResult = await res.json();
      setExplanation(result.impact.summary);
    } catch {
      setError("Couldn't load explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReplace() {
    if (!replacementName.trim()) return;
    callEditApi("replace", {
      replacement: { name: replacementName.trim() },
    });
  }

  function handleRemove() {
    callEditApi("remove");
  }

  function handleExplain() {
    setActiveAction("explain");
    fetchExplanation();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        aria-label={`Edit ${ingredientName}`}
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </button>

      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="font-heading text-lg">
            {ingredientName}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-8 space-y-3">
          <AnimatePresence mode="wait">
            {/* ── Default: 3 action buttons ── */}
            {activeAction === null && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-2xl h-12"
                  onClick={() => setActiveAction("replace")}
                >
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  Replace ingredient
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-2xl h-12"
                  onClick={() => setActiveAction("remove")}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Remove ingredient
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-2xl h-12"
                  onClick={handleExplain}
                >
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  Explain impact if removed
                </Button>
              </motion.div>
            )}

            {/* ── Replace input ── */}
            {activeAction === "replace" && (
              <motion.div
                key="replace"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  Replace <span className="font-medium text-foreground">{ingredientName}</span> with:
                </p>
                <Input
                  placeholder="e.g. coconut milk"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleReplace();
                  }}
                  autoFocus
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl"
                    onClick={() => setActiveAction(null)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-xl"
                    onClick={handleReplace}
                    disabled={loading || !replacementName.trim()}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Replace"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Remove confirmation ── */}
            {activeAction === "remove" && (
              <motion.div
                key="remove"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  Remove <span className="font-medium text-foreground">{ingredientName}</span> from this recipe?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl"
                    onClick={() => setActiveAction(null)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={handleRemove}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Explain impact ── */}
            {activeAction === "explain" && (
              <motion.div
                key="explain"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}

                {!loading && explanation && (
                  <div className="rounded-2xl bg-accent/60 p-4">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <span className="text-xs font-semibold text-amber-700">
                          Impact of removing {ingredientName}
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-accent-foreground">
                          {explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}

                <Button
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setActiveAction(null)}
                >
                  Back
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared error for replace/remove actions */}
          {error && activeAction !== "explain" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
