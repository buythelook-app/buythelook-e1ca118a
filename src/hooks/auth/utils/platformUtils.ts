
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
    return () => {}; // No cleanup needed for web
  }
  
  logger.info("Setting up deep link listener in SocialSignIn for mobile");
  
  // Initialize as null, will be set after the promise resolves
  let listenerHandle: any = null;
  
  // Set up the listener and store the handle when resolved
  App.addListener('appUrlOpen', (data) => {
    logger.info('Deep link received in SocialSignIn:', { data: data.url });
    callback();
  }).then(handle => {
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
