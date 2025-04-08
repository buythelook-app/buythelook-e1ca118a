
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'Buy The Look Beta 0.0.5',
  webDir: 'dist',
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  },
  server: {
    androidScheme: "https",
    hostname: "buythelook",
    cleartext: true,
    url: "https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com?forceHideBadge=true"
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
