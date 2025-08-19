import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

interface UseMagicLinkAuthProps {
  setProviderLoading: (isLoading: boolean) => void;
}

export const useMagicLinkAuth = ({
  setProviderLoading,
}: UseMagicLinkAuthProps) => {
  const { toast } = useToast();

  const handleMagicLinkSignIn = async (email: string) => {
    try {
      logger.info("Magic Link sign-in started", { 
        data: { 
          email, 
          timestamp: new Date().toISOString() 
        } 
      });
      
      setProviderLoading(true);
      
      // Get the current site URL for the redirect
      const redirectUrl = window.location.origin;
      
      logger.info("Sending magic link", { 
        data: { 
          email, 
          redirectUrl,
          timestamp: new Date().toISOString() 
        } 
      });

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        logger.error("Magic Link sign-in error:", { 
          context: "Magic Link authentication",
          data: {
            errorMessage: error.message,
            errorCode: error.status,
            email
          }
        });
        throw error;
      }
      
      logger.info("Magic Link sent successfully", { 
        data: { 
          email,
          timestamp: new Date().toISOString() 
        } 
      });

      toast({
        title: "קישור נשלח!",
        description: `קישור התחברות נשלח לכתובת ${email}. בדוק את תיבת המייל שלך.`,
        variant: "default",
      });

    } catch (error: any) {
      logger.error("Magic Link sign-in failed:", { 
        context: "Magic Link authentication",
        data: {
          errorMessage: error.message,
          email,
          stack: error.stack
        }
      });
      
      toast({
        title: "שגיאה",
        description: error.message || "נכשל בשליחת קישור התחברות",
        variant: "destructive",
      });
    } finally {
      setProviderLoading(false);
    }
  };

  return { handleMagicLinkSignIn };
};