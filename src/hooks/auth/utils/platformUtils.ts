
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
  
  const listener = App.addListener('appUrlOpen', (data) => {
    logger.info('Deep link received in SocialSignIn:', { data: data.url });
    callback();
  });
  
  return () => {
    logger.info("Cleaning up deep link listener");
    listener.remove();
  };
};
