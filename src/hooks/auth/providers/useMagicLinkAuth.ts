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
      
      // Get the current site URL for the redirect - make it same tab
      const redirectUrl = `${window.location.origin}/auth?type=magiclink`;
      
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
        title: "Link Sent!",
        description: `Login link sent to ${email}. Check your inbox.`,
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
        title: "Error",
        description: error.message || "Failed to send login link",
        variant: "destructive",
      });
    } finally {
      setProviderLoading(false);
    }
  };

  return { handleMagicLinkSignIn };
};