import type { KeyAction } from "@elgato/streamdeck";
import type { UsageData } from "../types/usage";
import type { IUsageFetcher } from "./usage-fetcher";
import { AnthropicUsageFetcher } from "./usage-fetcher";
import { ensureValidToken, clearCachedToken } from "./token-refresher";
import {
  renderCombinedSvg,
  renderSevenDaySvg,
  renderFiveHourSvg,
  renderErrorSvg,
  renderLoadingSvg,
} from "../rendering/svg-renderer";

export type PluginState = "idle" | "fetching" | "rate_limited" | "error" | "token_expired" | "not_signed_in";
export type ActionType = "combined" | "seven-day" | "five-hour";

interface RegisteredAction {
  action: KeyAction;
  type: ActionType;
}

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export class RefreshManager {
  private static instance: RefreshManager;

  private actions: RegisteredAction[] = [];
  private state: PluginState = "idle";
  private lastData: UsageData | null = null;
  private fetcher: IUsageFetcher = new AnthropicUsageFetcher();
  private intervalMs = DEFAULT_INTERVAL_MS;
  private timer: ReturnType<typeof setInterval> | null = null;
  private rateLimitTimer: ReturnType<typeof setTimeout> | null = null;
  private fetching = false;

  private constructor() {}

  static getInstance(): RefreshManager {
    if (!RefreshManager.instance) {
      RefreshManager.instance = new RefreshManager();
    }
    return RefreshManager.instance;
  }

  setFetcher(fetcher: IUsageFetcher): void {
    this.fetcher = fetcher;
  }

  setInterval(minutes: number): void {
    this.intervalMs = Math.max(MIN_INTERVAL_MS, minutes * 60 * 1000);
    this.restartTimer();
  }

  registerAction(action: KeyAction, type: ActionType): void {
    this.actions.push({ action, type });

    // Start the timer if this is the first action
    if (this.actions.length === 1) {
      this.start();
    }

    // Render immediately with cached data or loading state
    this.renderAction({ action, type });
  }

  unregisterAction(actionId: string): void {
    this.actions = this.actions.filter((a) => a.action.id !== actionId);

    // Stop the timer if no actions are registered
    if (this.actions.length === 0) {
      this.stop();
    }
  }

  async triggerManualRefresh(): Promise<void> {
    if (this.state === "rate_limited") return;
    await this.doFetch();
  }

  getState(): PluginState {
    return this.state;
  }

  getLastUsageData(): UsageData | null {
    return this.lastData;
  }

  private start(): void {
    this.doFetch();
    this.restartTimer();
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.rateLimitTimer) {
      clearTimeout(this.rateLimitTimer);
      this.rateLimitTimer = null;
    }
  }

  private restartTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => this.doFetch(), this.intervalMs);
  }

  private async doFetch(): Promise<void> {
    // Deduplicate concurrent fetches
    if (this.fetching) return;
    this.fetching = true;
    this.state = "fetching";

    try {
      const token = await ensureValidToken();
      if (!token) {
        this.state = "not_signed_in";
        this.renderAll();
        return;
      }

      const result = await this.fetcher.fetch(token);

      if (result.ok) {
        this.lastData = result.data;
        this.state = "idle";
      } else {
        switch (result.error) {
          case "unauthorized":
            clearCachedToken();
            // Try once more with fresh credentials
            const freshToken = await ensureValidToken();
            if (freshToken) {
              const retry = await this.fetcher.fetch(freshToken);
              if (retry.ok) {
                this.lastData = retry.data;
                this.state = "idle";
                break;
              }
            }
            this.state = "token_expired";
            break;

          case "rate_limited":
            this.state = "rate_limited";
            const cooldown = result.retryAfterMs ?? RATE_LIMIT_COOLDOWN_MS;
            this.rateLimitTimer = setTimeout(() => {
              this.state = "idle";
              this.doFetch();
            }, cooldown);
            break;

          default:
            this.state = "error";
            break;
        }
      }
    } finally {
      this.fetching = false;
      this.renderAll();
    }
  }

  private renderAll(): void {
    for (const registered of this.actions) {
      this.renderAction(registered);
    }
  }

  private renderAction(registered: RegisteredAction): void {
    const svg = this.getSvgForAction(registered.type);
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    registered.action.setImage(dataUrl);
  }

  private getSvgForAction(type: ActionType): string {
    if (this.state === "not_signed_in") return renderErrorSvg("Not Signed In");
    if (this.state === "token_expired") return renderErrorSvg("Token Expired");
    if (this.state === "rate_limited") return renderErrorSvg("Rate Limited");
    if (this.state === "error") return renderErrorSvg("Error");

    if (!this.lastData) return renderLoadingSvg();

    switch (type) {
      case "combined":
        return renderCombinedSvg(this.lastData);
      case "seven-day":
        return renderSevenDaySvg(this.lastData);
      case "five-hour":
        return renderFiveHourSvg(this.lastData);
    }
  }
}
