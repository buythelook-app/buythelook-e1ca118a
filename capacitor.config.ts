import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'Buy The Look',
  webDir: 'dist',
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 3000
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
  server: {
    androidScheme: "https",
    hostname: "app",
    cleartext: true
    // Removed direct URL override to use the default index.html
  },
  ios: {
    scheme: "buythelook"
  }
};

export default config;
