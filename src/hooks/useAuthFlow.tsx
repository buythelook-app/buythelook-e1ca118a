
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuthState } from "./auth/useAuthState";
import { useAuthDeepLinks } from "./auth/useAuthDeepLinks";
import { useAuthUrlParams } from "./auth/useAuthUrlParams";
import { useAuthSession } from "./auth/useAuthSession";
import logger from "@/lib/logger";

export const useAuthFlow = () => {
  const {
    isLoading, isSignIn, isPasswordRecovery, authError,
    toggleAuthMode, setIsLoading, setIsSignIn, setIsPasswordRecovery, setAuthError
  } = useAuthState();

  // Set up deep link handling for native platforms
  useAuthDeepLinks({
    setIsLoading,
    setAuthError,
    setIsPasswordRecovery,
    setIsSignIn
  });
  
  // Handlers for URL parameters and session checking
  const { handleDeepLink } = useAuthUrlParams({
    setIsLoading,
    setAuthError,
    setIsPasswordRecovery,
    setIsSignIn
  });
  
  const { checkSession } = useAuthSession({
    setIsLoading,
    setAuthError
  });

  useEffect(() => {
    logger.info("Auth flow init started", {
      data: {
        timestamp: new Date().toISOString()
      }
    });
    
    let isMounted = true;
    
    // Initialize authentication flow
    const init = async () => {
      const isMobileNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      logger.info("Platform check:", { 
        data: {
          platform,
          isMobile: isMobileNative ? "mobile native" : "browser",
          capacitorVersion: Capacitor.VERSION
        }
      });
      
      try {
        // First check for deep link or URL parameters
        logger.info("Checking for deep links or URL parameters", {
          data: {
            url: window.location.href,
            hash: window.location.hash,
            search: window.location.search,
            hasForceHiddenBadge: window.location.search.includes('forceHideBadge'),
            hasAuthParam: window.location.hash.includes('/auth') || window.location.pathname.includes('/auth')
          }
        });
        
        const handled = await handleDeepLink();
        logger.info("Deep link handling result", {
          data: {
            handled,
            timestamp: new Date().toISOString()
          }
        });
        
        // Then check for existing session if not already handled
        if (!handled && isMounted) {
          logger.info("No deep link handled, checking for existing session");
          await checkSession();
        }
      } catch (error: any) {
        logger.error("Auth flow init error:", { 
          data: {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
      } finally {
        if (isMounted) {
          logger.info("Auth flow init complete, setting isLoading to false");
          setIsLoading(false);
        }
      }
    };
    
    // Use a short timeout to ensure the UI is rendered first to avoid blank screen
    const timeoutId = setTimeout(() => {
      init();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    isLoading,
    isSignIn,
    isPasswordRecovery,
    toggleAuthMode,
    authError,
  };
};
