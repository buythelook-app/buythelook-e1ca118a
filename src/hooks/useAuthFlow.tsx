
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuthState } from "./auth/useAuthState";
import { useAuthDeepLinks } from "./auth/useAuthDeepLinks";
import { useAuthUrlParams } from "./auth/useAuthUrlParams";
import { useAuthSession } from "./auth/useAuthSession";

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
    console.log("Auth flow init started");
    let isMounted = true;
    
    // Initialize authentication flow
    const init = async () => {
      const isMobileNative = Capacitor.isNativePlatform();
      console.log("Platform check:", isMobileNative ? "mobile native" : "browser");
      
      const handled = await handleDeepLink();
      if (!handled && isMounted) {
        await checkSession();
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
