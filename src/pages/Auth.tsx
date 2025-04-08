
import React from "react";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { PasswordRecoveryForm } from "@/components/auth/PasswordRecoveryForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const Auth = () => {
  const { isLoading, isSignIn, isPasswordRecovery, toggleAuthMode, authError } = useAuthFlow();

  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      {authError && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-50">
          <Alert variant="destructive" className="bg-red-900/80 text-white border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="w-full max-w-md">
        {isPasswordRecovery ? (
          <PasswordRecoveryForm />
        ) : (
          <AuthForm isSignIn={isSignIn} onToggleAuthMode={toggleAuthMode} />
        )}
      </div>
    </div>
  );
};
