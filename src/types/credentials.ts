export interface ClaudeOAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
  subscriptionType: string;
  rateLimitTier: string;
}

export interface ClaudeCredentialsFile {
  claudeAiOauth: ClaudeOAuthCredentials;
  organizationUuid: string;
}
