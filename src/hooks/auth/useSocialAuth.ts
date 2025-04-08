
import { useState, useEffect } from "react";
import { App } from "@capacitor/app";
import { useToast } from "@/hooks/use-toast";
import { useGoogleAuth } from "./providers/useGoogleAuth";
import { useAppleAuth } from "./providers/useAppleAuth";
import { useAIAuth } from "./providers/useAIAuth";
import { detectMobilePlatform, setupMobileDeepLinkListener } from "./utils/platformUtils";
import { SocialAuthState } from "./types/socialAuthTypes";
import logger from "@/lib/logger";

export type SocialProvider = "google" | "apple" | "ai";

export const useSocialAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<SocialAuthState>({
    isLoading: {
      google: false,
      apple: false,
      ai: false
    },
    isMobile: false,
    authAttemptId: null
  });

  useEffect(() => {
    // Check if running on a native mobile platform
    const isMobile = detectMobilePlatform();
    setAuthState(prev => ({
      ...prev,
      isMobile
    }));
    
    // Set up deep link listener for mobile platforms
    const cleanupListener = setupMobileDeepLinkListener(() => {
      // Reset loading state when we receive the deep link
      resetLoadingState();
    });
    
    return cleanupListener;
  }, []);

  // This effect will automatically reset loading state if stuck for too long
  useEffect(() => {
    const { isLoading } = authState;
    if (isLoading.google || isLoading.apple) {
      logger.info(`Setting auth timeout - Google: ${isLoading.google}, Apple: ${isLoading.apple}`);
      
      const timeoutId = setTimeout(() => {
        if (isLoading.google || isLoading.apple) {
          logger.info("Authentication timeout - resetting loading state after 60 seconds");
          resetLoadingState();
          
          toast({
            title: "Authentication timeout",
            description: "The authentication process took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 60000); // 1 minute timeout
      
      return () => {
        logger.info("Clearing auth timeout");
        clearTimeout(timeoutId);
      };
    }
  }, [authState.isLoading, toast]);

  const resetLoadingState = () => {
    logger.info("Resetting auth loading state");
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: {
        ...prev.isLoading,
        google: false, 
        apple: false 
      },
      authAttemptId: null
    }));
  };

  const setProviderLoading = (provider: SocialProvider, isLoading: boolean) => {
    logger.info(`Setting ${provider} loading state to ${isLoading}`);
    
    setAuthState(prev => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [provider]: isLoading
      }
    }));
  };

  const setAuthAttemptId = (id: string | null) => {
    logger.info(`Setting auth attempt ID to ${id}`);
    
    setAuthState(prev => ({
      ...prev,
      authAttemptId: id
    }));
  };

  // Initialize provider-specific hooks
  const { handleGoogleSignIn } = useGoogleAuth({
    isMobile: authState.isMobile,
    setProviderLoading: (isLoading) => setProviderLoading("google", isLoading),
    setAuthAttemptId,
    resetLoadingState
  });

  const { handleAppleSignIn } = useAppleAuth({
    isMobile: authState.isMobile,
    setProviderLoading: (isLoading) => setProviderLoading("apple", isLoading),
    setAuthAttemptId
  });

  const { handleAISignIn } = useAIAuth({
    setProviderLoading: (isLoading) => setProviderLoading("ai", isLoading)
  });

  return {
    authState,
    handleGoogleSignIn,
    handleAppleSignIn,
    handleAISignIn
  };
};
