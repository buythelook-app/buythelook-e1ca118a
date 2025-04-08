
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        throw error;
      }
      
      if (data.session) {
        console.log("Active session found", data.session.user?.id);
        navigate('/home');
        return true;
      }
      
      console.log("No active session found");
      return false;
    } catch (error: any) {
      console.error("Session check error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkSession };
};
