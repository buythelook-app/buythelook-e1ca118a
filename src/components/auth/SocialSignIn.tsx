
import { useSocialAuth } from "@/hooks/auth/useSocialAuth";
import { GoogleButton } from "./buttons/GoogleButton";
import { AppleButton } from "./buttons/AppleButton";
import { AIButton } from "./buttons/AIButton";
import { AuthDivider } from "./dividers/AuthDivider";

export const SocialSignIn = () => {
  const { 
    authState, 
    handleGoogleSignIn, 
    handleAppleSignIn, 
    handleAISignIn 
  } = useSocialAuth();
  
  const { isLoading } = authState;

  return (
    <div className="space-y-3 w-full">
      <AuthDivider />
      
      <div className="grid gap-3">
        <GoogleButton 
          isLoading={isLoading.google} 
          onClick={handleGoogleSignIn} 
        />
        
        <AppleButton 
          isLoading={isLoading.apple} 
          onClick={handleAppleSignIn} 
        />

        <AIButton 
          isLoading={isLoading.ai} 
          onClick={handleAISignIn} 
        />
      </div>
    </div>
  );
};
