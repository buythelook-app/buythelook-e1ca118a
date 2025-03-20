
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'Buy The Look',
  webDir: 'dist',
  // Remove the server URL for production builds
  // server: {
  //   url: 'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
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
  }
};

export default config;
