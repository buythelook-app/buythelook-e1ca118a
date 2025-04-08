
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
    logger.info("Auth flow init started");
    let isMounted = true;
    
    // Initialize authentication flow
    const init = async () => {
      const isMobileNative = Capacitor.isNativePlatform();
      logger.info("Platform check:", { 
        data: isMobileNative ? "mobile native" : "browser" 
      });
      
      try {
        // First check for deep link or URL parameters
        const handled = await handleDeepLink();
        
        // Then check for existing session if not already handled
        if (!handled && isMounted) {
          await checkSession();
        }
      } catch (error) {
        logger.error("Auth flow init error:", { data: error });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
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
