
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthSessionProps {
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
}

export const useAuthSession = ({
  setIsLoading,
  setAuthError,
}: UseAuthSessionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      console.log("Checking current session");
      
      // Add a timeout to handle cases where getSession might hang
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Session check timed out")), 10000);
      });
      
      // Race the session check with a timeout
      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      const { data, error } = result as Awaited<typeof sessionPromise>;
      
      if (error) {
        console.error("Session check error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }
      
      if (data.session) {
        console.log("Active session found", data.session.user?.id);
        console.log("Session expires at:", new Date(data.session.expires_at! * 1000).toLocaleString());
        console.log("User provider:", data.session.user?.app_metadata?.provider);
        
        // Check if the session is about to expire (within 5 minutes)
        const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (expiresAt - now < fiveMinutes) {
          console.log("Session about to expire, attempting to refresh");
          try {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.warn("Session refresh failed:", refreshError);
            } else {
              console.log("Session refreshed successfully");
            }
          } catch (refreshError) {
            console.error("Error refreshing session:", refreshError);
          }
        }
        
        navigate('/home');
        return true;
      }
      
      console.log("No active session found");
      return false;
    } catch (error: any) {
      console.error("Session check error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      if (error.message === "Session check timed out") {
        toast({
          title: "Session check timed out",
          description: "Unable to verify your authentication status. Please try again.",
          variant: "destructive",
        });
      }
      
      setAuthError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkSession };
};
