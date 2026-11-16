interface AppConfigExtra {
  commit?: string;
  sourceCodeUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  relayBaseUrl?: string;
  defaultHost?: string;
  webmailUrl?: string;
  updateRepo?: string;
  iosSharedKeychainGroup?: string;
  iosAppKeychainGroup?: string;
  apnsEnvironment?: string;
}

let extra: AppConfigExtra = {};
let expoName = 'EMAIL by Nordible.Co';
let expoVersion = '0.0.0';

try {
  // Safely import expo-constants if in an Expo/React Native runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Constants = require('expo-constants')?.default ?? require('expo-constants');
  extra = (Constants?.expoConfig?.extra ?? {}) as AppConfigExtra;
  if (Constants?.expoConfig?.name) expoName = Constants.expoConfig.name;
  if (Constants?.expoConfig?.version) expoVersion = Constants.expoConfig.version;
} catch {
  // In pure Node.js / unit test environments, extra remains empty.
}

/**
 * Centralized application configuration.
 * All environment-dependent values and external URLs MUST be accessed through this object,
 * sourced strictly from environment variables (.env) and build-time configuration.
 */
export const APP_CONFIG = {
  // App Metadata
  appName: expoName,
  appVersion: expoVersion,
  commit: extra.commit ?? process.env.GITHUB_SHA ?? 'dev',

  // Core Service Endpoints & URLs from .env
  websiteUrl: process.env.EXPO_PUBLIC_WEBSITE_URL || extra.websiteUrl || 'https://email.nordible.co/',
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || extra.privacyPolicyUrl || 'https://email.nordible.co/privacy',
  webmailUrl: process.env.EXPO_PUBLIC_WEBMAIL_URL || extra.webmailUrl || 'https://mailapp1.nordible.co',
  relayBaseUrl: process.env.EXPO_PUBLIC_RELAY_BASE_URL || extra.relayBaseUrl || 'https://email-notifications.nordible.co',
  defaultHost: process.env.EXPO_PUBLIC_DEFAULT_HOST || extra.defaultHost || 'mail1.nordible.co',
  sourceCodeUrl: process.env.EXPO_PUBLIC_SOURCE_CODE_URL || process.env.SOURCE_CODE_URL || extra.sourceCodeUrl || 'https://github.com/nordible/app.email.nordible.co',
  updateRepo: process.env.EXPO_PUBLIC_UPDATE_REPO || extra.updateRepo || 'nordible/app.email.nordible.co',

  // Apple & Native Signing Settings
  appleTeamId: process.env.APPLE_TEAM_ID || '63VV52LF88',
  iosSharedKeychainGroup: extra.iosSharedKeychainGroup || '',
  iosAppKeychainGroup: extra.iosAppKeychainGroup || '',
  apnsEnvironment: extra.apnsEnvironment || 'production',
} as const;

export type AppConfig = typeof APP_CONFIG;
