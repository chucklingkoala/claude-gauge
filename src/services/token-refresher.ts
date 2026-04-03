import { readCredentials, isTokenExpired } from "./credential-reader";
import type { ClaudeOAuthCredentials } from "../types/credentials";

let cachedCredentials: ClaudeOAuthCredentials | null = null;

export async function ensureValidToken(): Promise<string | null> {
  // If we have a cached token that's still valid, use it
  if (cachedCredentials && !isTokenExpired(cachedCredentials)) {
    return cachedCredentials.accessToken;
  }

  // Read fresh credentials from disk (Claude Desktop may have refreshed them)
  const fresh = await readCredentials();
  if (!fresh) {
    cachedCredentials = null;
    return null;
  }

  // If the fresh token is still valid, cache and return it
  if (!isTokenExpired(fresh)) {
    cachedCredentials = fresh;
    return fresh.accessToken;
  }

  // Token is expired even after re-reading — Claude Desktop hasn't refreshed it.
  // We could attempt an active refresh here, but the refresh endpoint and client_id
  // are undocumented. For now, return null and show "Token Expired" state.
  cachedCredentials = null;
  return null;
}

export function clearCachedToken(): void {
  cachedCredentials = null;
}
