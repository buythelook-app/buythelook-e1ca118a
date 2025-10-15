
import { useSocialAuth } from "@/hooks/auth/useSocialAuth";
import { MagicLinkButton } from "./buttons/MagicLinkButton";
import { GoogleButton } from "./buttons/GoogleButton";
import { AppleButton } from "./buttons/AppleButton";
import { AIButton } from "./buttons/AIButton";
import { AuthDivider } from "./dividers/AuthDivider";
import logger from "@/lib/logger";

export const SocialSignIn = () => {
  const { 
    authState, 
    handleMagicLinkSignIn,
    handleGoogleSignIn, 
    handleAppleSignIn, 
    handleAISignIn 
  } = useSocialAuth();
  
  const { isLoading } = authState;

  const onMagicLinkSend = async (email: string) => {
    logger.info("Magic Link button used in SocialSignIn", {
      data: {
        timestamp: new Date().toISOString(),
        currentLoadingState: isLoading,
        email
      }
    });
    await handleMagicLinkSignIn(email);
  };

  const onGoogleClick = () => {
    logger.info("Google button clicked in SocialSignIn", {
      data: {
        timestamp: new Date().toISOString(),
        currentLoadingState: isLoading
      }
    });
    handleGoogleSignIn();
  };

  const onAppleClick = () => {
    logger.info("Apple button clicked in SocialSignIn", {
      data: {
        timestamp: new Date().toISOString(),
        currentLoadingState: isLoading
      }
    });
    handleAppleSignIn();
  };

  const onAIClick = () => {
    logger.info("AI button clicked in SocialSignIn", {
      data: {
        timestamp: new Date().toISOString(),
        currentLoadingState: isLoading
      }
    });
    handleAISignIn();
  };

  return (
    <div className="space-y-3 w-full">
      <GoogleButton 
        isLoading={isLoading.google} 
        onClick={onGoogleClick} 
      />
    </div>
  );
};
