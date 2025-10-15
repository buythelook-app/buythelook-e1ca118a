
import { useSocialAuth } from "@/hooks/auth/useSocialAuth";
import { GoogleButton } from "./buttons/GoogleButton";
import { AuthDivider } from "./dividers/AuthDivider";
import logger from "@/lib/logger";

export const SocialSignIn = () => {
  const { 
    authState, 
    handleGoogleSignIn
  } = useSocialAuth();
  
  const { isLoading } = authState;

  const onGoogleClick = () => {
    logger.info("Google button clicked in SocialSignIn", {
      data: {
        timestamp: new Date().toISOString(),
        currentLoadingState: isLoading
      }
    });
    handleGoogleSignIn();
  };

  return (
    <div className="space-y-3 w-full">
      <AuthDivider />
      
      <div className="grid gap-3">
        <GoogleButton 
          isLoading={isLoading.google} 
          onClick={onGoogleClick} 
        />
      </div>
    </div>
  );
};
