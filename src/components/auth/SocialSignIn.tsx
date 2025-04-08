
import { useSocialAuth } from "@/hooks/auth/useSocialAuth";
import { GoogleButton } from "./buttons/GoogleButton";
import { AppleButton } from "./buttons/AppleButton";
import { AIButton } from "./buttons/AIButton";
import { AuthDivider } from "./dividers/AuthDivider";
import logger from "@/lib/logger";

export const SocialSignIn = () => {
  const { 
    authState, 
    handleGoogleSignIn, 
    handleAppleSignIn, 
    handleAISignIn 
  } = useSocialAuth();
  
  const { isLoading } = authState;

  const onGoogleClick = () => {
    logger.info("Google button clicked in SocialSignIn");
    handleGoogleSignIn();
  };

  const onAppleClick = () => {
    logger.info("Apple button clicked in SocialSignIn");
    handleAppleSignIn();
  };

  const onAIClick = () => {
    logger.info("AI button clicked in SocialSignIn");
    handleAISignIn();
  };

  return (
    <div className="space-y-3 w-full">
      <AuthDivider />
      
      <div className="grid gap-3">
        <GoogleButton 
          isLoading={isLoading.google} 
          onClick={onGoogleClick} 
        />
        
        <AppleButton 
          isLoading={isLoading.apple} 
          onClick={onAppleClick} 
        />

        <AIButton 
          isLoading={isLoading.ai} 
          onClick={onAIClick} 
        />
      </div>
    </div>
  );
};
