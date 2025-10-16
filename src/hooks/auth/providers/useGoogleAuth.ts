
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

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: true
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
        
        toast({
          title: "Google Sign-in Error",
          description: error.message || "Failed to start Google authentication",
          variant: "destructive",
        });
        
        resetLoadingState();
        return;
      }
      
      if (data?.url) {
        logger.info("Opening Google OAuth in new window/tab");
        
        // Open in a new window/tab
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          'google-oauth',
          `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );
        
        if (!popup) {
          logger.info("Popup blocked, opening in same window");
          window.location.href = data.url;
          return;
        }
        
        // Monitor popup and check for session updates
        const checkInterval = setInterval(async () => {
          // Check if popup is closed
          if (popup.closed) {
            logger.info("Popup closed, checking for session");
            clearInterval(checkInterval);
            
            // Wait a moment for auth state to propagate
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if we have a session now
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              logger.info("Session found after popup closed, triggering auth state change");
              // The onAuthStateChange in useAuthState will handle navigation
              // Just trigger it by refreshing the session
              await supabase.auth.refreshSession();
            }
            
            resetLoadingState();
          }
        }, 500);
        
        // Clean up after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (popup && !popup.closed) {
            popup.close();
          }
          resetLoadingState();
        }, 120000);
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
