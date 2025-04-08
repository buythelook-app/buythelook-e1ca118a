
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
      console.log("URL Hash:", window.location.hash);
      console.log("URL Search:", window.location.search);
      
      setIsLoading(true);
      
      try {
        console.log("Processing OAuth redirect");
        
        // Check for error parameter in URL first
        const url = new URL(window.location.href);
        const urlError = url.searchParams.get('error') || 
                        (url.hash && new URLSearchParams(url.hash.substring(1)).get('error'));
                        
        if (urlError) {
          console.error("Auth error detected in URL:", urlError);
          const errorDescription = url.searchParams.get('error_description') || 
                                  (url.hash && new URLSearchParams(url.hash.substring(1)).get('error_description')) || 
                                  "Authentication failed";
          throw new Error(errorDescription);
        }
        
        // Wait briefly to ensure auth state is ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Try to exchange the auth code for a session
        try {
          const { error: sessionError } = await supabase.auth.refreshSession();
          if (sessionError) {
            console.error("Error refreshing session:", JSON.stringify(sessionError, null, 2));
            // Don't throw, continue trying to get session
          }
        } catch (refreshError) {
          console.error("Exception during session refresh:", refreshError);
          // Continue with flow, don't exit
        }
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session:", JSON.stringify(error, null, 2));
            throw error;
          }
          
          if (data.session) {
            console.log("Authentication successful from redirect:", data.session.user?.id);
            console.log("User email:", data.session.user?.email);
            console.log("Auth provider:", data.session.user?.app_metadata?.provider);
            setAuthError(null);
            toast({
              title: "Success",
              description: "Authentication successful.",
            });
            navigate('/home');
            return true;
          } else {
            console.log("No session after processing redirect");
          }
        } catch (sessionError) {
          console.error("Failed to get session:", sessionError);
          throw new Error("Failed to verify authentication status");
        }
        
        // Check for password recovery
        if (url.hash.includes('type=recovery') || 
            url.search.includes('type=recovery')) {
          console.log("Password recovery flow detected");
          setIsPasswordRecovery(true);
          setIsSignIn(true);
          return true;
        }
      } catch (error: any) {
        console.error("Auth redirect processing error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setAuthError(error.message || "Authentication failed");
        toast({
          title: "Error",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("No auth parameters found in URL");
    }
    
    return false;
  };

  return { handleDeepLink };
};
