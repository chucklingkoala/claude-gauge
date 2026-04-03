import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import type { ClaudeCredentialsFile, ClaudeOAuthCredentials } from "../types/credentials";

const CREDENTIALS_PATH = join(homedir(), ".claude", ".credentials.json");

export async function readCredentials(): Promise<ClaudeOAuthCredentials | null> {
  try {
    const raw = await readFile(CREDENTIALS_PATH, "utf-8");
    const parsed: ClaudeCredentialsFile = JSON.parse(raw);

    const oauth = parsed?.claudeAiOauth;
    if (!oauth?.accessToken || !oauth?.expiresAt) {
      return null;
    }

    return oauth;
  } catch {
    return null;
  }
}

export function isTokenExpired(credentials: ClaudeOAuthCredentials, bufferMs = 5 * 60 * 1000): boolean {
  return credentials.expiresAt <= Date.now() + bufferMs;
}
