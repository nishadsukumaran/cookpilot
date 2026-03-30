/**
 * Debug trace types for development inspection.
 *
 * Attached to API responses only when NODE_ENV === "development".
 * Never included in production builds.
 */

export interface DebugTrace {
  /** Unique trace ID for this request */
  traceId: string;

  /** Total server-side processing time */
  totalMs: number;

  /** Pipeline stages executed */
  stages: TraceStage[];

  /** Final source breakdown */
  source: {
    structured: boolean;
    ai: boolean;
    mock: boolean;
  };

  /** Warnings or fallback conditions hit */
  flags: string[];
}

export interface TraceStage {
  /** Stage name */
  name: string;

  /** What this stage did */
  action: string;

  /** Time taken for this stage */
  durationMs: number;

  /** Key-value details (no secrets) */
  details: Record<string, string | number | boolean | null>;
}

/**
 * Helper to build a trace. Call start(), then addStage(), then finish().
 */
export function createTrace(): TraceBuilder {
  return new TraceBuilder();
}

export class TraceBuilder {
  private startTime = Date.now();
  private stages: TraceStage[] = [];
  private flags: string[] = [];
  private traceId = Math.random().toString(36).slice(2, 10);

  addStage(
    name: string,
    action: string,
    durationMs: number,
    details: Record<string, string | number | boolean | null> = {}
  ): this {
    this.stages.push({ name, action, durationMs, details });
    return this;
  }

  addFlag(flag: string): this {
    this.flags.push(flag);
    return this;
  }

  finish(source: DebugTrace["source"]): DebugTrace {
    return {
      traceId: this.traceId,
      totalMs: Date.now() - this.startTime,
      stages: this.stages,
      source,
      flags: this.flags,
    };
  }
}

/** Only attach trace in development */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
