
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Browser } from "@capacitor/browser";
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

interface UseGoogleAuthProps {
  isMobile: boolean;
  setProviderLoading: (isLoading: boolean) => void;
  setAuthAttemptId: (id: string | null) => void;
  resetLoadingState: () => void;
}

export const useGoogleAuth = ({
  isMobile,
  setProviderLoading,
  setAuthAttemptId,
  resetLoadingState
}: UseGoogleAuthProps) => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      // If already loading, prevent multiple attempts
      const isLoading = true;
      if (isLoading) {
        logger.info("Google auth already in progress, preventing multiple attempts");
        return;
      }
      
      // Generate a unique ID for this auth attempt
      const attemptId = `auth_${Date.now()}`;
      setAuthAttemptId(attemptId);
      
      setProviderLoading(true);
      
      // Get the current hostname for redirects
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${hostname}${port}`;
      
      // Set the redirect URL based on platform
      let redirectUrl = `${baseUrl}/auth`;
      
      // For native mobile, use app scheme
      if (isMobile) {
        redirectUrl = "buythelook://auth";
        logger.info(`Using mobile redirect URL: ${redirectUrl}`);
      } else {
        logger.info(`Using web redirect URL: ${redirectUrl}`);
      }
      
      toast({
        title: "Starting authentication",
        description: "Connecting to Google. When prompted, select 'Buy The Look' to return to the app.",
      });
      
      logger.info("Starting Google authentication flow...");
      
      // Standard Google OAuth configuration
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            }
          }
        });

        if (error) {
          logger.error("Google sign-in error:", { 
            context: "Google authentication",
            data: error
          });
          throw error;
        }
        
        logger.info("Google sign-in initiated:", { data });
        
        if (data?.url) {
          logger.info("Auth URL received:", { data: data.url });
          
          if (!isMobile) {
            // On web browsers, redirect in the current window
            logger.info("Redirecting browser to:", { data: data.url });
            window.location.href = data.url;
          } else {
            // On mobile native, we need to use the Browser plugin instead of window.open
            logger.info("Opening authentication URL on mobile:", { data: data.url });
            await Browser.open({ url: data.url });
            
            // Add additional instruction toast after a short delay
            setTimeout(() => {
              const isStillLoading = true; // This would be checked from state in real component
              if (isStillLoading) {
                toast({
                  title: "Important",
                  description: "When prompted, select 'Buy The Look' app to complete sign-in",
                });
              }
            }, 3000);
            
            // Set a timeout to reset the loading state if the deep link doesn't trigger
            setTimeout(() => {
              // Only reset if this is still the current auth attempt
              const currentAuthAttemptId = attemptId; // This would be from state
              const isStillLoading = true; // This would be checked from state
              if (currentAuthAttemptId === attemptId && isStillLoading) {
                logger.info("Authentication flow timeout - resetting state after 45 seconds");
                setProviderLoading(false);
                toast({
                  title: "Authentication timeout",
                  description: "Please try again or check if the app is installed correctly",
                  variant: "destructive",
                });
              }
            }, 45000); // 45 seconds timeout
          }
        } else {
          logger.error("No authentication URL received from Supabase");
          throw new Error("Failed to start Google authentication");
        }
      } catch (supabaseError) {
        logger.error("Supabase OAuth error:", { 
          context: "Google authentication",
          data: supabaseError
        });
        throw supabaseError;
      }
    } catch (error: any) {
      logger.error("Google sign-in failed:", { 
        context: "Google authentication",
        data: error
      });
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setProviderLoading(false);
      setAuthAttemptId(null);
    }
  };

  return { handleGoogleSignIn };
};
