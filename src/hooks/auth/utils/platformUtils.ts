
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import logger from "@/lib/logger";

export const detectMobilePlatform = (): boolean => {
  const isMobile = Capacitor.isNativePlatform();
  logger.info(`Platform check - isMobile: ${isMobile}`);
  return isMobile;
};

export const setupMobileDeepLinkListener = (callback: () => void): (() => void) => {
  if (!Capacitor.isNativePlatform()) {
    logger.info("Not a mobile platform, skipping deep link listener setup");
    return () => {}; // No cleanup needed for web
  }
  
  logger.info("Setting up deep link listener for mobile");
  
  let listenerHandle: any = null;
  
  // Set up the listener and store the handle when it's created
  const listenerPromise = App.addListener('appUrlOpen', (data) => {
    logger.info('Deep link received:', { data: data.url });
    callback();
  });
  
  // Store the handle when the Promise resolves
  listenerPromise.then(handle => {
    logger.info("Deep link listener successfully created");
    listenerHandle = handle;
  });
  
  // Return a cleanup function that only calls remove() when the handle exists
  return () => {
    logger.info("Cleaning up deep link listener");
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};
