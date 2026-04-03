import { action, SingletonAction, type WillAppearEvent, type WillDisappearEvent, type KeyDownEvent, type DidReceiveSettingsEvent } from "@elgato/streamdeck";
import { RefreshManager } from "../services/refresh-manager";
import type { ActionSettings } from "../types/settings";

@action({ UUID: "com.claudegauge.usage.combined" })
export class CombinedDisplayAction extends SingletonAction<ActionSettings> {
  private refreshManager = RefreshManager.getInstance();

  override onWillAppear(ev: WillAppearEvent<ActionSettings>): void {
    if (ev.action.isKey()) {
      this.refreshManager.registerAction(ev.action, "combined");
    }
  }

  override onWillDisappear(ev: WillDisappearEvent<ActionSettings>): void {
    this.refreshManager.unregisterAction(ev.action.id);
  }

  override async onKeyDown(ev: KeyDownEvent<ActionSettings>): Promise<void> {
    await this.refreshManager.triggerManualRefresh();
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionSettings>): void {
    const interval = ev.payload.settings.refreshInterval;
    if (typeof interval === "number") {
      this.refreshManager.setInterval(interval);
    }
  }
}
