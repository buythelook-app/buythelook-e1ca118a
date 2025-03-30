/**
 * This file provides global window objects for Capacitor functionality
 * to avoid ES module resolution issues in WebView.
 */

// Create basic Capacitor object for runtime detection of platform
const CapacitorImpl = {
  isNativePlatform: () => {
    return typeof window.androidBridge !== 'undefined' || 
           typeof window.webkit !== 'undefined';
  },
  getPlatform: () => {
    if (typeof window.androidBridge !== 'undefined') return 'android';
    if (typeof window.webkit !== 'undefined') return 'ios';
    return 'web';
  },
  convertFileSrc: (path: string) => path,
  isPluginAvailable: () => true,
};

// Basic SplashScreen implementation
const SplashScreenImpl = {
  hide: () => {
    console.log('[SplashScreen Shim] hide called');
    return Promise.resolve();
  },
  show: () => {
    console.log('[SplashScreen Shim] show called');
    return Promise.resolve();
  },
};

// Basic App implementation
const AppImpl = {
  addListener: (eventName: string, listenerFunc: any) => {
    console.log(`[App Shim] addListener for '${eventName}' called`);
    return { 
      remove: () => { 
        console.log(`[App Shim] removeListener for '${eventName}' called`);
      }
    };
  },
  removeAllListeners: () => {
    console.log('[App Shim] removeAllListeners called');
    return Promise.resolve();
  },
  exitApp: () => {
    console.log('[App Shim] exitApp called');
  },
  getLaunchUrl: () => {
    console.log('[App Shim] getLaunchUrl called');
    return Promise.resolve({ url: '' });
  },
  getState: () => {
    console.log('[App Shim] getState called');
    return Promise.resolve({ isActive: true });
  },
};

// Browser implementation for in-app browser experience
const BrowserImpl = {
  open: (options: { url: string }) => {
    console.log('[Browser Shim] open called with URL:', options.url);
    
    // In web environment, just open in a new tab
    if (!CapacitorImpl.isNativePlatform()) {
      window.open(options.url, '_blank');
    } else {
      // For native platforms, we'd use the actual plugin
      // This is just a fallback that opens in the system browser
      window.open(options.url, '_blank');
    }
    
    return Promise.resolve();
  },
  close: () => {
    console.log('[Browser Shim] close called');
    return Promise.resolve();
  },
  addListener: (eventName: string, listenerFunc: any) => {
    console.log(`[Browser Shim] addListener for '${eventName}' called`);
    return {
      remove: () => {
        console.log(`[Browser Shim] removeListener for '${eventName}' called`);
      }
    };
  }
};

// Initialize the global objects
export function initCapacitorGlobals() {
  console.log('Initializing Capacitor globals...');
  
  // Set global Capacitor objects
  window.Capacitor = window.Capacitor || CapacitorImpl;
  window.SplashScreen = window.SplashScreen || SplashScreenImpl;
  window.App = window.App || AppImpl;
  window.Browser = window.Browser || BrowserImpl;
  
  console.log('Capacitor globals initialized');
  console.log('  - isNativePlatform:', window.Capacitor.isNativePlatform());
  console.log('  - platform:', window.Capacitor.getPlatform());
}

// Automatically initialize when imported
initCapacitorGlobals();
