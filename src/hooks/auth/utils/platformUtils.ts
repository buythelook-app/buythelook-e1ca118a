
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import logger from "@/lib/logger";

export const detectMobilePlatform = (): boolean => {
  const isMobile = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  logger.info(`Platform check`, {
    data: {
      isMobile,
      platform,
      userAgent: navigator.userAgent
    }
  });
  return isMobile;
};

export const setupMobileDeepLinkListener = (callback: () => void): (() => void) => {
  if (!Capacitor.isNativePlatform()) {
    logger.info("Not a mobile platform, skipping deep link listener setup", {
      data: {
        platform: Capacitor.getPlatform(),
        isNativePlatform: false
      }
    });
    return () => {}; // No cleanup needed for web
  }
  
  logger.info("Setting up deep link listener for mobile", {
    data: {
      platform: Capacitor.getPlatform(),
      timestamp: new Date().toISOString()
    }
  });
  
  let listenerHandle: any = null;
  
  // Set up the listener and store the handle when it's created
  const listenerPromise = App.addListener('appUrlOpen', (data) => {
    logger.info('Deep link received in platform utils:', {
      data: {
        url: data.url,
        timestamp: new Date().toISOString()
      }
    });
    callback();
  });
  
  // Store the handle when the Promise resolves
  listenerPromise.then(handle => {
    logger.info("Deep link listener successfully created", {
      data: {
        timestamp: new Date().toISOString()
      }
    });
    listenerHandle = handle;
  });
  
  // Return a cleanup function that only calls remove() when the handle exists
  return () => {
    logger.info("Cleaning up deep link listener in platformUtils", {
      data: {
        hasListener: !!listenerHandle,
        timestamp: new Date().toISOString()
      }
    });
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};
