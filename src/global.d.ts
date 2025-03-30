/**
 * Global TypeScript declarations for the application
 */

interface Window {
  appInitialized?: boolean;
  androidBridge?: any;
  webkit?: any;
  Capacitor?: {
    isNativePlatform: () => boolean;
    getPlatform: () => string;
    convertFileSrc: (path: string) => string;
    isPluginAvailable: () => boolean;
  };
  SplashScreen?: {
    hide: () => Promise<void>;
    show: () => Promise<void>;
  };
  App?: {
    addListener: (event: string, callback: any) => { remove: () => void };
    removeAllListeners: () => Promise<void>;
    exitApp: () => void;
    getLaunchUrl: () => Promise<{ url: string }>;
    getState: () => Promise<{ isActive: boolean }>;
  };
}
