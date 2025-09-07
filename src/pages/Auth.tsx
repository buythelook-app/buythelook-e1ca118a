
import React, { useEffect } from "react";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ErrorBoundary from "@/components/auth/ErrorBoundary";
import logger from "@/lib/logger";

export const Auth = () => {
  const { isLoading, isSignIn, toggleAuthMode, authError } = useAuthFlow();

  useEffect(() => {
    // Log component mount for debugging
    logger.info("Auth page mounted", {
      context: "Auth component",
      data: { isLoading, isSignIn }
    });

    // Log any auth errors
    if (authError) {
      logger.error("Authentication error detected", {
        context: "Auth component",
        data: { authError }
      });
    }
    
    return () => {
      logger.info("Auth page unmounted", { context: "Auth component" });
    };
  }, [isLoading, isSignIn, authError]);

  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground />
        {authError && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-50">
            <Alert variant="destructive" className="bg-destructive/80 text-destructive-foreground border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          </div>
        )}
        <div className="w-full max-w-md">
          <AuthForm isSignIn={isSignIn} onToggleAuthMode={toggleAuthMode} />
        </div>
      </div>
    </ErrorBoundary>
  );
};
