
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ErrorBoundary from "@/components/auth/ErrorBoundary";
import logger from "@/lib/logger";

export const Auth = () => {
  const navigate = useNavigate();
  const { isLoading, isSignIn, toggleAuthMode, authError } = useAuthFlow();
  const [checkingSession, setCheckingSession] = useState(true);

  // Critical: Check if user is already logged in and redirect
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔵 Auth page: Checking for existing session');
        logger.info("Auth page: Checking for existing session");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth page: Session check error', error);
          logger.error("Auth page: Session check error", { data: { error: error.message } });
          setCheckingSession(false);
          return;
        }

        if (session) {
          console.log('✅ Auth page: User already logged in, redirecting to home', {
            userId: session.user.id,
            email: session.user.email
          });
          logger.info("Auth page: User already logged in, redirecting to home", {
            data: { userId: session.user.id }
          });
          navigate('/', { replace: true });
          return;
        }

        console.log('ℹ️ Auth page: No existing session found');
        logger.info("Auth page: No existing session found");
        setCheckingSession(false);
      } catch (err: any) {
        console.error('❌ Auth page: Error checking session', err);
        logger.error("Auth page: Error checking session", { data: { error: err.message } });
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

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

  if (isLoading || checkingSession) {
    return <AuthLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
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
