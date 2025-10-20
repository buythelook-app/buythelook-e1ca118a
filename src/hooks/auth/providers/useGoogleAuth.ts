
import { supabase } from "@/integrations/supabase/client";
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
      setProviderLoading(true);

      const redirectUrl = "https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com/auth/callback";
      
      console.log("🔵 GOOGLE OAUTH REQUEST DETAILS:");
      console.log("================================");
      console.log("Provider: google");
      console.log("Redirect URL:", redirectUrl);
      console.log("Opening in popup window");
      console.log("================================");

      // Set up message listener for popup callback
      const messageListener = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log("🟢 Received auth success message from popup");
          logger.info("Google authentication successful via popup");
          
          // Clean up
          window.removeEventListener('message', messageListener);
          
          // Refresh the session in the main window before redirecting
          supabase.auth.getSession().then(() => {
            window.location.href = '/';
          });
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.log("🔴 Received auth error message from popup");
          logger.error("Google authentication failed in popup", {
            data: { error: event.data.error }
          });
          
          // Clean up
          window.removeEventListener('message', messageListener);
          resetLoadingState();
          
          toast({
            title: "Authentication Failed",
            description: event.data.error || "Failed to complete Google sign-in",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', messageListener);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        logger.error("Google sign-in error:", { 
          context: "Google authentication",
          data: {
            errorMessage: error.message,
            errorCode: error.status,
            errorName: error.name
          }
        });
        
        window.removeEventListener('message', messageListener);
        
        toast({
          title: "Google Sign-in Error",
          description: error.message || "Failed to start Google authentication",
          variant: "destructive",
        });
        
        resetLoadingState();
        return;
      }
      
      if (data?.url) {
        console.log("🟢 GOOGLE OAUTH URL RECEIVED:");
        console.log("================================");
        console.log("OAuth URL:", data.url);
        console.log("Opening popup...");
        console.log("================================");
        
        // Open popup window
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          'Google Sign In',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        );
        
        if (!popup) {
          window.removeEventListener('message', messageListener);
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site to sign in with Google",
            variant: "destructive",
          });
          resetLoadingState();
          return;
        }
        
        // Monitor if popup is closed manually
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            window.removeEventListener('message', messageListener);
            
            // Check if we got a session (in case the message was missed)
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                logger.info("Google sign-in successful (detected via polling)");
                window.location.href = '/';
              } else {
                logger.info("Popup closed without authentication");
                resetLoadingState();
              }
            });
          }
        }, 500);
      }
    } catch (error: any) {
      logger.error("Google sign-in failed:", { 
        context: "Google authentication",
        data: {
          errorMessage: error.message
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
