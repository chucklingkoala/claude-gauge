import type { JsonValue } from "@elgato/streamdeck";

export type ActionSettings = {
  refreshInterval?: number;
  [key: string]: JsonValue | undefined;
};
