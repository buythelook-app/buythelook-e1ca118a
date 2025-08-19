
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMagicLinkAuth } from "./providers/useMagicLinkAuth";
import { useAppleAuth } from "./providers/useAppleAuth";
import { useAIAuth } from "./providers/useAIAuth";
import { detectMobilePlatform, setupMobileDeepLinkListener } from "./utils/platformUtils";
import { SocialAuthState } from "./types/socialAuthTypes";
import logger from "@/lib/logger";

export type SocialProvider = "magiclink" | "apple" | "ai";

export const useSocialAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<SocialAuthState>({
    isLoading: {
      magiclink: false,
      apple: false,
      ai: false
    },
    isMobile: false,
    authAttemptId: null
  });

  useEffect(() => {
    // Check if running on a native mobile platform
    const isMobile = detectMobilePlatform();
    logger.info("Social auth initialization", {
      data: {
        isMobile,
        timestamp: new Date().toISOString()
      }
    });
    
    setAuthState(prev => ({
      ...prev,
      isMobile
    }));
    
    // Set up deep link listener for mobile platforms
    const cleanupListener = setupMobileDeepLinkListener(() => {
      // Reset loading state when we receive the deep link
      logger.info("Deep link callback triggered in useSocialAuth", {
        data: {
          timestamp: new Date().toISOString(),
          currentLoadingState: authState.isLoading
        }
      });
      resetLoadingState();
    });
    
    return cleanupListener;
  }, []);

  // This effect will automatically reset loading state if stuck for too long
  useEffect(() => {
    const { isLoading } = authState;
    if (isLoading.magiclink || isLoading.apple) {
      logger.info(`Setting auth timeout`, {
        data: {
          magiclink: isLoading.magiclink,
          apple: isLoading.apple,
          timestamp: new Date().toISOString()
        }
      });
      
      const timeoutId = setTimeout(() => {
        if (isLoading.magiclink || isLoading.apple) {
          logger.info("Authentication timeout - resetting loading state after 60 seconds", {
            data: {
              timestamp: new Date().toISOString(),
              authAttemptId: authState.authAttemptId
            }
          });
          
          resetLoadingState();
          
          toast({
            title: "Authentication timeout",
            description: "The authentication process took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 60000); // 1 minute timeout
      
      return () => {
        logger.info("Clearing auth timeout", {
          data: {
            timestamp: new Date().toISOString(),
            authAttemptId: authState.authAttemptId
          }
        });
        clearTimeout(timeoutId);
      };
    }
  }, [authState.isLoading, authState.authAttemptId, toast]);

  const resetLoadingState = () => {
    logger.info("Resetting auth loading state", {
      data: {
        previousState: authState.isLoading,
        timestamp: new Date().toISOString(),
        authAttemptId: authState.authAttemptId
      }
    });
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: {
        ...prev.isLoading,
        magiclink: false, 
        apple: false,
        ai: false
      },
      authAttemptId: null
    }));
  };

  const setProviderLoading = (provider: SocialProvider, isLoading: boolean) => {
    logger.info(`Setting ${provider} loading state`, {
      data: {
        provider,
        isLoading,
        timestamp: new Date().toISOString()
      }
    });
    
    setAuthState(prev => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [provider]: isLoading
      }
    }));
  };

  const setAuthAttemptId = (id: string | null) => {
    logger.info(`Setting auth attempt ID`, {
      data: {
        id,
        timestamp: new Date().toISOString()
      }
    });
    
    setAuthState(prev => ({
      ...prev,
      authAttemptId: id
    }));
  };

  // Initialize provider-specific hooks
  const { handleMagicLinkSignIn } = useMagicLinkAuth({
    setProviderLoading: (isLoading) => setProviderLoading("magiclink", isLoading),
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
    handleMagicLinkSignIn,
    handleAppleSignIn,
    handleAISignIn
  };
};
