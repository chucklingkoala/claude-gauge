import type { UsageData, FetchResult } from "../types/usage";

const USAGE_URL = "https://api.anthropic.com/api/oauth/usage";
const BETA_HEADER = "oauth-2025-04-20";

export interface IUsageFetcher {
  fetch(accessToken: string): Promise<FetchResult>;
}

export class AnthropicUsageFetcher implements IUsageFetcher {
  async fetch(accessToken: string): Promise<FetchResult> {
    try {
      const response = await globalThis.fetch(USAGE_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "anthropic-beta": BETA_HEADER,
        },
      });

      if (response.status === 401) {
        return { ok: false, error: "unauthorized" };
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 10 * 60 * 1000;
        return { ok: false, error: "rate_limited", retryAfterMs };
      }

      if (!response.ok) {
        return { ok: false, error: "unknown" };
      }

      const data: UsageData = await response.json();

      if (!data?.five_hour || !data?.seven_day) {
        return { ok: false, error: "unknown" };
      }

      return { ok: true, data };
    } catch {
      return { ok: false, error: "network" };
    }
  }
}
