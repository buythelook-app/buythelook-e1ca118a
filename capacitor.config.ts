
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'Buy The Look',
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
  // Fixed configuration for deep linking and native performance
  server: {
    androidScheme: "https",
    hostname: "buythelook"
  },
  // Add specific deep linking schemes
  ios: {
    scheme: "buythelook"
  }
};

export default config;
