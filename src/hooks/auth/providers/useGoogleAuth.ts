
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
      logger.info("Google sign-in started", { data: { timestamp: new Date().toISOString() } });
      
      // Generate a unique ID for this auth attempt
      const attemptId = `auth_${Date.now()}`;
      setAuthAttemptId(attemptId);
      setProviderLoading(true);
      
      // Get the current hostname for redirects
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${hostname}${port}`;

      logger.info("Auth attempt details", { 
        data: { 
          attemptId, 
          baseUrl,
          isMobile 
        }
      });
      
      // Set the redirect URL based on platform
      let redirectUrl = `${baseUrl}/auth`;
      
      // For native mobile, use app scheme
      if (isMobile) {
        redirectUrl = "buythelook://auth";
        logger.info(`Using mobile redirect URL`, { data: { redirectUrl } });
      } else {
        logger.info(`Using web redirect URL`, { data: { redirectUrl } });
      }
      
      // Start Google OAuth flow
      logger.info("Starting OAuth flow with Supabase", { 
        data: { 
          provider: 'google', 
          redirectUrl,
          hasQueryParams: true
        } 
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        logger.error("Google sign-in error:", { 
          context: "Google authentication",
          data: {
            errorMessage: error.message,
            errorCode: error.status,
            errorName: error.name,
            stack: error.stack
          }
        });
        throw error;
      }
      
      logger.info("Google sign-in initiated:", { 
        data: { 
          hasUrl: !!data?.url,
          urlStart: data?.url ? data.url.substring(0, 50) + '...' : null,
        } 
      });
      
      if (data?.url) {
        if (!isMobile) {
          // On web browsers, open in a new tab
          logger.info("Opening auth URL in browser", { data: { isMobile: false } });
          window.location.href = data.url;
        } else {
          // On mobile native, use the Browser plugin
          logger.info("Opening auth URL with Capacitor Browser", { data: { isMobile: true } });
          await Browser.open({ url: data.url });
          
          // Set a timeout to reset the loading state if the deep link doesn't trigger
          logger.info("Setting authentication timeout", { data: { timeoutMs: 45000 } });
          setTimeout(() => {
            logger.info("Authentication timeout triggered", { data: { attemptId } });
            resetLoadingState();
          }, 45000);
        }
      } else {
        logger.error("Failed to start Google authentication", { 
          data: { 
            reason: "No URL returned from Supabase",
            authData: JSON.stringify(data)
          }
        });
        throw new Error("Failed to start Google authentication");
      }
    } catch (error: any) {
      logger.error("Google sign-in failed:", { 
        context: "Google authentication",
        data: {
          errorMessage: error.message,
          errorObject: JSON.stringify(error),
          stack: error.stack
        }
      });
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      resetLoadingState();
    }
  };

  return { handleGoogleSignIn };
};
