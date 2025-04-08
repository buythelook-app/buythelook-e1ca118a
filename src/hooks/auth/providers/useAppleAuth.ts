
import { supabase } from "@/lib/supabase";
import { Browser } from "@capacitor/browser";
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

interface UseAppleAuthProps {
  isMobile: boolean;
  setProviderLoading: (isLoading: boolean) => void;
  setAuthAttemptId: (id: string | null) => void;
}

export const useAppleAuth = ({
  isMobile,
  setProviderLoading,
  setAuthAttemptId
}: UseAppleAuthProps) => {
  const { toast } = useToast();

  const handleAppleSignIn = async () => {
    try {
      const isLoading = true; // This would be checked from state in real component
      if (isLoading) {
        logger.info("Apple auth already in progress");
        return;
      }
      
      const attemptId = `auth_${Date.now()}`;
      setAuthAttemptId(attemptId);
      setProviderLoading(true);
      
      // Set the redirect URL based on platform
      let redirectUrl = `${window.location.origin}/auth`;
      
      // For native mobile, use app scheme
      if (isMobile) {
        redirectUrl = "buythelook://auth";
        logger.info(`Using mobile redirect URL: ${redirectUrl}`);
      }
      
      logger.info("Starting Apple authentication flow...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        logger.error("Apple sign-in error:", {
          context: "Apple authentication",
          data: error
        });
        throw error;
      }
      
      logger.info("Apple sign-in initiated:", { data });
      
      if (data?.url) {
        logger.info("Auth URL received:", { data: data.url });
        
        if (!isMobile) {
          logger.info("Redirecting browser to:", { data: data.url });
          window.location.href = data.url;
        } else {
          logger.info("Opening authentication URL on mobile:", { data: data.url });
          await Browser.open({ url: data.url });
          
          setTimeout(() => {
            const isStillLoading = true; // This would be checked from state in real component
            if (isStillLoading) {
              toast({
                title: "Important",
                description: "When prompted, select 'Buy The Look' app to complete sign-in",
              });
            }
          }, 3000);
          
          setTimeout(() => {
            const currentAuthAttemptId = attemptId; // This would be from state
            const isStillLoading = true; // This would be checked from state
            if (currentAuthAttemptId === attemptId && isStillLoading) {
              logger.info("Authentication flow timeout - resetting state");
              setProviderLoading(false);
              toast({
                title: "Authentication timeout",
                description: "Please try again or check if the app is installed correctly",
                variant: "destructive",
              });
            }
          }, 45000);
        }
      }
    } catch (error: any) {
      logger.error("Apple sign-in failed:", {
        context: "Apple authentication",
        data: error
      });
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Apple",
        variant: "destructive",
      });
      setProviderLoading(false);
      setAuthAttemptId(null);
    }
  };

  return { handleAppleSignIn };
};
