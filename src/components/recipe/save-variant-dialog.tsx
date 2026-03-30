"use client";

import { useState } from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TrustMetrics, ChangeItem } from "@/lib/engines/transformation/trust";

interface SaveVariantDialogProps {
  recipeId: string;
  recipeName: string;
  servings: number;
  originalCalories: number;
  trustMetrics: TrustMetrics;
  children: React.ReactNode;
}

export function SaveVariantDialog({
  recipeId,
  recipeName,
  servings,
  originalCalories,
  trustMetrics,
  children,
}: SaveVariantDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${recipeName} (Modified)`);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const changes = trustMetrics.changeSummary.filter((c) => c.direction !== "unchanged");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseRecipeId: recipeId,
          name,
          servings,
          ingredientChanges: changes.map((c) => ({
            ingredient: c.ingredient,
            originalAmount: parseFloat(c.from) || 0,
            newAmount: c.to === "removed" ? 0 : parseFloat(c.to) || 0,
            unit: c.from.replace(/[\d.]+\s*/, "").trim(),
            reason: c.direction,
          })),
          trustMetrics: {
            confidence: trustMetrics.confidence,
            risk: trustMetrics.risk,
            authenticity: trustMetrics.authenticity,
            caloriesBefore: originalCalories,
            caloriesAfter: trustMetrics.comparison.calories.after,
          },
          changeSummary: changes
            .map((c) => `${c.ingredient}: ${c.from} → ${c.to}`)
            .join(", "),
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setOpen(false), 1200);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSaved(false); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Save This Version</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Version name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Changes preview */}
          {changes.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                {changes.length} change{changes.length !== 1 ? "s" : ""}
              </span>
              <div className="mt-1.5 max-h-32 overflow-y-auto space-y-1">
                {changes.slice(0, 5).map((c) => (
                  <div key={c.ingredient} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{c.ingredient}</span>
                    <span className={cn(
                      "font-medium",
                      c.direction === "reduced" ? "text-green-600" : c.direction === "removed" ? "text-red-600" : ""
                    )}>
                      {c.from} → {c.to}
                    </span>
                  </div>
                ))}
                {changes.length > 5 && (
                  <p className="text-[10px] text-muted-foreground">+{changes.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          {/* Trust summary */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">Authenticity</span>
            <span className="text-xs font-semibold">{trustMetrics.authenticity.score}% — {trustMetrics.authenticity.label}</span>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving || saved || !name.trim()}
            className="w-full h-11 rounded-2xl font-semibold"
          >
            {saved ? (
              <><Check className="mr-2 h-4 w-4" /> Saved!</>
            ) : saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Version</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
