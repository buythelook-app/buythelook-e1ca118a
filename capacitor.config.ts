
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'Buy The Look Beta 0.0.3',
  webDir: 'dist',
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined
    }
  },
  // Server configuration for deep linking
  server: {
    androidScheme: "https",
    hostname: "buythelook",
    cleartext: true
  },
  // iOS and Android scheme configuration
  ios: {
    scheme: "buythelook"
  },
  android: {
    scheme: "buythelook",
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined
    }
  }
};

export default config;
