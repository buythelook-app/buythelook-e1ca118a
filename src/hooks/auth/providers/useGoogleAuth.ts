
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
          skipBrowserRedirect: true // Always skip, we'll handle it manually
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
        
        // Open in a new window/tab - this works even in iframes
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
          // Popup was blocked, try opening in same window
          logger.info("Popup blocked, opening in same window");
          window.location.href = data.url;
        }
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
