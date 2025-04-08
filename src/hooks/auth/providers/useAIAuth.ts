
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

interface UseAIAuthProps {
  setProviderLoading: (isLoading: boolean) => void;
}

export const useAIAuth = ({ setProviderLoading }: UseAIAuthProps) => {
  const { toast } = useToast();

  const handleAISignIn = () => {
    setProviderLoading(true);
    
    logger.info("AI sign in initiated (feature coming soon)");
    
    toast({
      title: "AI Sign In",
      description: "This feature is coming soon!",
    });
    
    setTimeout(() => {
      setProviderLoading(false);
    }, 1000);
  };

  return { handleAISignIn };
};
