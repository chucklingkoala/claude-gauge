export interface UsagePeriod {
  utilization: number;
  resets_at: string;
}

export interface UsageData {
  five_hour: UsagePeriod;
  seven_day: UsagePeriod;
}

export type FetchResult =
  | { ok: true; data: UsageData }
  | { ok: false; error: "unauthorized" | "rate_limited" | "network" | "unknown"; retryAfterMs?: number };
