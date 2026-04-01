"use client";

import { useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function SavedError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the exact error to help debug
    console.error("[Saved Page Error]", error.message, error.stack);

    // Report to server for Vercel logs visibility
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "client_error",
        page: "/saved",
        message: error.message,
        stack: error.stack?.slice(0, 500),
        digest: error.digest,
        timestamp: Date.now(),
      }),
    }).catch(() => {});

    // Auto-reload on chunk mismatch (deployment race condition)
    const msg = error.message ?? "";
    if (
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Unexpected token")
    ) {
      window.location.reload();
      return;
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Couldn't load saved recipes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This usually fixes itself with a refresh.
        </p>
        <p className="mt-2 text-[10px] text-muted-foreground/50 font-mono max-w-xs break-all">
          {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}
