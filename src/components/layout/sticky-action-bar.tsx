"use client";

import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-20 left-0 right-0 z-30 border-t border-border bg-background/80 px-4 py-3 backdrop-blur-xl md:bottom-0",
        className
      )}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
