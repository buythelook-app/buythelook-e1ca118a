
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logger from "@/lib/logger";

interface UseAuthDeepLinksProps {
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setIsSignIn: (isSignIn: boolean) => void;
}

export const useAuthDeepLinks = ({
  setIsLoading,
  setAuthError,
  setIsSignIn,
}: UseAuthDeepLinksProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    logger.info("Setting up deep link listener for auth");
    let deepLinkListener: any = null;
    
    // Set up deep link handler for native platforms
    if (Capacitor.isNativePlatform()) {
      logger.info("Setting up deep link listener for mobile", { 
        data: { platform: Capacitor.getPlatform() } 
      });
      
      deepLinkListener = App.addListener('appUrlOpen', async (data) => {
        logger.info('Deep link received in useAuthFlow:', { 
          data: {
            url: data.url,
            timestamp: new Date().toISOString()
          }
        });
        
        // Check if this is a password recovery link
        if (data.url.includes('type=recovery')) {
          logger.info('Password recovery deep link received');
          navigate('/reset-password');
          return;
        }
        
        if (data.url.includes('auth')) {
          setIsLoading(true);
          toast({
            title: "Processing",
            description: "Completing authentication...",
          });
          
          try {
            // Process any auth params in the URL if present
            if (data.url.includes('code=') || data.url.includes('token=')) {
              // Extract the URL parameters
              const url = new URL(data.url);
              const params = new URLSearchParams(url.search);
              const hash = url.hash ? new URLSearchParams(url.hash.substring(1)) : null;
              
              logger.info("Processing auth params from deep link URL", {
                data: {
                  urlParams: Object.fromEntries(params.entries()),
                  hashParams: hash ? Object.fromEntries(hash.entries()) : null,
                  hasCodeParam: params.has('code'),
                  hasTokenParam: params.has('token')
                }
              });
              
              // Check for error in URL parameters
              const urlError = params.get('error') || (hash && hash.get('error'));
              if (urlError) {
                const errorDesc = params.get('error_description') || 
                                 (hash && hash.get('error_description')) || 
                                 "Authentication error";
                
                logger.error("Error found in deep link URL", {
                  data: {
                    error: urlError,
                    description: errorDesc
                  }
                });
                
                throw new Error(errorDesc);
              }
            }
            
            // Wait to ensure auth state is updated
            logger.info("Waiting for auth state to update", {
              data: { waitTimeMs: 2000 }
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            // Verify session status
            const maxRetries = 10;
            let sessionData = await supabase.auth.getSession();
            logger.info("Initial session check:", { 
              data: {
                hasSession: !!sessionData.data.session,
                userId: sessionData.data.session?.user?.id,
                timestamp: new Date().toISOString()
              }
            });
            
            // Retry session check if no session found
            let currentRetry = 0;
            const checkSessionWithRetry = async () => {
              if (!sessionData.data.session && currentRetry < maxRetries) {
                logger.info(`Retry attempt ${currentRetry + 1}/${maxRetries}`, {
                  data: { timestamp: new Date().toISOString() }
                });
                
                toast({
                  title: "Verifying",
                  description: `Checking authentication status (${currentRetry + 1}/${maxRetries})...`,
                });
                
                // Try to manually exchange the token if possible
                try {
                  if (data.url.includes('code=')) {
                    const url = new URL(data.url);
                    const params = url.searchParams || new URLSearchParams(url.search);
                    const code = params.get('code');
                    
                    if (code) {
                      logger.info("Attempting to exchange auth code manually", {
                        data: { 
                          codeLength: code.length,
                          codePrefix: code.substring(0, 8) + '...'
                        }
                      });
                      
                      const result = await supabase.auth.refreshSession();
                      logger.info("Manual code exchange result", {
                        data: {
                          success: !result.error,
                          hasSession: !!result.data.session,
                          error: result.error?.message
                        }
                      });
                    }
                  }
                } catch (e: any) {
                  logger.error("Error during manual code exchange:", {
                    data: {
                      message: e.message,
                      stack: e.stack,
                      object: JSON.stringify(e)
                    }
                  });
                }
                
                // Wait and try again
                await new Promise((resolve) => setTimeout(resolve, 2000));
                try {
                  sessionData = await supabase.auth.getSession();
                  logger.info("Session check after retry:", {
                    data: {
                      hasSession: !!sessionData.data.session,
                      userId: sessionData.data.session?.user?.id,
                      attempt: currentRetry + 1
                    }
                  });
                } catch (sessionError: any) {
                  logger.error("Error getting session during retry:", {
                    data: {
                      message: sessionError.message,
                      attempt: currentRetry + 1
                    }
                  });
                }
                
                currentRetry++;
                
                if (!sessionData.data.session && currentRetry < maxRetries) {
                  return checkSessionWithRetry();
                } else {
                  return sessionData;
                }
              }
              return sessionData;
            };
            
            sessionData = await checkSessionWithRetry();
            
            if (sessionData.data.session) {
              logger.info("Session found after deep link:", {
                data: {
                  userId: sessionData.data.session.user?.id,
                  provider: sessionData.data.session.user?.app_metadata?.provider,
                  expiresAt: new Date(sessionData.data.session.expires_at! * 1000).toISOString()
                }
              });
              
              toast({
                title: "Success",
                description: "You have been signed in successfully.",
              });
              navigate('/home');
            } else {
              logger.error("No session after deep link and retries", {
                data: { maxRetries }
              });
              
              // Try a direct sign in with the provider
              try {
                if (data.url.includes('google')) {
                  logger.error("Google authentication incomplete", {
                    data: { 
                      url: data.url,
                      platform: Capacitor.getPlatform()
                    }
                  });
                  
                  setAuthError("Authentication process was interrupted. Please try signing in again.");
                  toast({
                    title: "Authentication Incomplete",
                    description: "The Google sign-in process was interrupted. Please try again.",
                    variant: "destructive",
                  });
                } else {
                  setAuthError("Authentication failed. Please try again.");
                  toast({
                    title: "Authentication Failed",
                    description: "Please try signing in again.",
                    variant: "destructive",
                  });
                }
              } catch (providerError: any) {
                logger.error("Provider sign-in error:", {
                  data: {
                    message: providerError.message,
                    stack: providerError.stack
                  }
                });
              }
              
              setIsLoading(false);
            }
          } catch (error: any) {
            logger.error("Deep link auth error:", {
              data: {
                message: error.message,
                stack: error.stack,
                object: JSON.stringify(error)
              }
            });
            
            setAuthError(error.message || "Authentication failed");
            toast({
              title: "Error",
              description: error.message || "Authentication failed",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        }
      });
      
      logger.info("Deep link listener set up successfully");
    }

    return () => {
      // Clean up app listener if on native platform
      if (deepLinkListener) {
        logger.info("Cleaning up deep link listener");
        deepLinkListener.remove();
      }
    };
  }, [navigate, toast, setIsLoading, setAuthError, setIsSignIn]);
};
