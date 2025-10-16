
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logger from "@/lib/logger";

interface UseAuthUrlParamsProps {
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setIsSignIn: (isSignIn: boolean) => void;
}

export const useAuthUrlParams = ({
  setIsLoading,
  setAuthError,
  setIsSignIn,
}: UseAuthUrlParamsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeepLink = async () => {
    // Only handle magic link and password recovery here
    // OAuth callbacks are handled by /auth/callback
    const url = new URL(window.location.href);
    const type = url.searchParams.get('type') || 
                (url.hash && new URLSearchParams(url.hash.substring(1)).get('type'));
    
    // Check for magic link authentication  
    if (type === 'magiclink') {
      console.log("Magic link authentication detected");
      logger.info("Magic link authentication detected");
      setIsLoading(true);
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Magic link session error:", sessionError);
          throw sessionError;
        }
        
        if (sessionData.session) {
          console.log("Magic link authentication successful:", sessionData.session.user?.id);
          setAuthError(null);
          toast({
            title: "Welcome!",
            description: "Successfully signed in via email link.",
          });
          navigate('/');
          return true;
        }
      } catch (error: any) {
        console.error("Magic link error:", error);
        setAuthError(error.message || "Authentication failed");
        toast({
          title: "Error",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    // Check for password recovery type in URL parameters
    if (type === 'recovery') {
      console.log("Password recovery link detected");
      logger.info("Password recovery link detected, redirecting to reset password page");
      navigate('/reset-password');
      return true;
    }
    
    return false;
  };

  return { handleDeepLink };
};
