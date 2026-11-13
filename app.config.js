const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const VERSION = fs.readFileSync(path.join(__dirname, 'VERSION'), 'utf8').trim();

let COMMIT = process.env.GITHUB_SHA || '';
if (!COMMIT) {
  try {
    COMMIT = execSync('git rev-parse --short HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    COMMIT = 'dev';
  }
}
COMMIT = COMMIT.slice(0, 7);

// App Store Connect rejects a build whose CFBundleVersion it has already seen
// for this CFBundleShortVersionString, so this has to advance on every upload
// even when VERSION does not. CI passes the workflow run number; local builds
// fall back to 1 (never uploaded).
const IOS_BUILD_NUMBER = process.env.IOS_BUILD_NUMBER || '1';

// Apple team: prefixes the keychain groups the app shares with its
// notification service extension (plugins/ios-push). Not a secret.
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || '8ZANF9LQ39';
// Which APNs host the device tokens belong to: TestFlight and App Store builds
// use production, simulators and development builds the sandbox.
const APS_ENVIRONMENT = process.env.APS_ENVIRONMENT === 'development' ? 'development' : 'production';

module.exports = {
  expo: {
    name: 'Nordible Business Email',
    slug: 'nordible-email',
    // mailto: lets Android/iOS offer the app for mail links in other apps;
    // nordiblemail / bulwarkmail: webmail's sign-in link (nordiblemail://pair?...).
    scheme: ['nordiblemobile', 'nordiblemail', 'bulwarkmobile', 'bulwarkmail', 'mailto', 'co.nordible.mail'],
    version: VERSION,
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        image: './assets/splash-icon.png',
        backgroundColor: '#09090b',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'co.nordible.mail',
      buildNumber: IOS_BUILD_NUMBER,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#145BFF',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'co.nordible.mail',
      allowBackup: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      'react-native-quick-crypto',
      '@react-native-community/datetimepicker',
      'expo-localization',
      [
        'expo-camera',
        {
          cameraPermission:
            'Nordible Business Email uses the camera to scan sign-in QR codes shown in webmail.',
          microphonePermission: false,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Nordible Business Email needs access to your photos so you can attach them to emails and set contact photos.',
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      ['./plugins/ios-push', { apsEnvironment: APS_ENVIRONMENT, teamId: APPLE_TEAM_ID }],
      // TLS client certificates (#3): the iOS side of src/lib/client-cert.ts.
      './plugins/ios-client-cert',
      // The iOS inbox widget (WidgetKit); src/widgets/ios.ts feeds it.
      ['./plugins/ios-widget', { teamId: APPLE_TEAM_ID }],
      // The reading fonts (Settings > Accessibility > Font) for the app's
      // text on iOS, found by the family names in the files
      // (src/theme/reading-fonts.ts). iOS only: Android reads the same files
      // from its hand-maintained assets/fonts, where the plugin would copy
      // them onto themselves.
      [
        'expo-font',
        {
          ios: {
            fonts: [
              'AtkinsonHyperlegibleNext.ttf',
              'AtkinsonHyperlegibleNext_bold.ttf',
              'Lexend.ttf',
              'Lexend_bold.ttf',
              'OpenDyslexic.ttf',
              'OpenDyslexic_bold.ttf',
            ].map((file) => `./android/app/src/main/assets/fonts/${file}`),
          },
        },
      ],
      // Bundles the Involved sound calendar reminders (src/lib/calendar-
      // notifications.ts) and new mail (plugins/ios-push) play on iOS.
      // Android has it in res/raw.
      [
        'expo-notifications',
        {
          mode: APS_ENVIRONMENT,
          sounds: ['./assets/sounds/involved_notification.wav'],
        },
      ],
    ],
    extra: {
      commit: COMMIT,
      sourceCodeUrl: process.env.SOURCE_CODE_URL || 'https://github.com/nordible/app.email.nordible.co',
      iosSharedKeychainGroup: `${APPLE_TEAM_ID}.co.nordible.shared`,
      iosAppKeychainGroup: `${APPLE_TEAM_ID}.co.nordible.mail`,
      relayBaseUrl: process.env.EXPO_PUBLIC_RELAY_BASE_URL || 'https://email-notifications.nordible.co',
      apnsEnvironment: APS_ENVIRONMENT === 'development' ? 'sandbox' : 'production',
    },
  },
};
