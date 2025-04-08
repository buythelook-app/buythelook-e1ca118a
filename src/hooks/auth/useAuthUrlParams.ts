
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface UseAuthUrlParamsProps {
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  setIsSignIn: (isSignIn: boolean) => void;
}

export const useAuthUrlParams = ({
  setIsLoading,
  setAuthError,
  setIsPasswordRecovery,
  setIsSignIn,
}: UseAuthUrlParamsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeepLink = async () => {
    const hasAuthParams = window.location.hash || 
                         window.location.search.includes('code=') || 
                         window.location.search.includes('token=') ||
                         window.location.search.includes('type=') ||
                         window.location.search.includes('error=') ||
                         window.location.search.includes('access_token=');
    
    if (hasAuthParams) {
      console.log("Auth params detected in URL:", window.location.href);
      
      setIsLoading(true);
      
      try {
        console.log("Processing OAuth redirect");
        
        // Wait briefly to ensure auth state is ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Try to exchange the auth code for a session
        const { error: sessionError } = await supabase.auth.refreshSession();
        if (sessionError) {
          console.error("Error refreshing session:", sessionError);
          // Don't throw, continue trying to get session
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setAuthError(error.message);
          throw error;
        }
        
        if (data.session) {
          console.log("Authentication successful from redirect, user:", data.session.user?.id);
          setAuthError(null);
          toast({
            title: "Success",
            description: "Authentication successful.",
          });
          navigate('/home');
          return true;
        }
        
        console.log("No session after processing redirect");
        
        // Check for password recovery
        const url = new URL(window.location.href);
        if (url.hash.includes('type=recovery') || 
            url.search.includes('type=recovery')) {
          console.log("Password recovery flow detected");
          setIsPasswordRecovery(true);
          setIsSignIn(true);
        }
        
        // Check for error in the URL
        if (url.search.includes('error=') || url.hash.includes('error=')) {
          console.error("Auth error in URL:", url.toString());
          setAuthError("Authentication error in URL");
          toast({
            title: "Authentication Error",
            description: "There was a problem with the authentication process. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Auth redirect processing error:", error);
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
    
    return false;
  };

  return { handleDeepLink };
};
