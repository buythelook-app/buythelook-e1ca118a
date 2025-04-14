
import { useState, useEffect } from "react";
import { PasswordRecoveryForm } from "@/components/auth/PasswordRecoveryForm";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { HomeButton } from "@/components/HomeButton";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

export const PasswordRecovery = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    logger.info("Password recovery page mounted", {
      context: "PasswordRecovery component",
      data: { url: window.location.href }
    });
    
    const parseHashParams = () => {
      // Check for deep link parameters
      const hash = window.location.hash;
      const url = new URL(window.location.href);
      
      // Look for auth parameters (access_token, type=recovery)
      const accessToken = new URLSearchParams(hash.substring(1)).get("access_token");
      const type = new URLSearchParams(hash.substring(1)).get("type") || 
                  url.searchParams.get("type");
      
      return { accessToken, type };
    };
    
    const verifySession = async () => {
      try {
        setIsLoading(true);
        
        const { accessToken, type } = parseHashParams();
        logger.info("Parsed recovery params", { 
          data: { accessToken: !!accessToken, type } 
        });
        
        if (type === "recovery" || accessToken) {
          // Check if we have a valid session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.error("Error getting session in password recovery", {
              data: { error: error.message }
            });
            setError("Invalid or expired reset link. Please request a new password reset.");
            setIsValidToken(false);
            return;
          }
          
          if (data.session) {
            logger.info("Valid session found for password reset");
            setIsValidToken(true);
            return;
          }
        } else {
          // No recovery parameters found
          logger.info("No recovery parameters found in URL");
          toast({
            title: "Invalid Request",
            description: "No valid password reset parameters found. Please request a password reset from the login page.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (err: any) {
        logger.error("Error in password recovery verification", {
          data: { error: err.message }
        });
        setError("An error occurred while processing your password reset. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
    
    return () => {
      logger.info("Password recovery page unmounted");
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-netflix-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      <HomeButton />
      
      {error && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-50">
          <Alert variant="destructive" className="bg-red-900/80 text-white border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {isValidToken ? (
          <PasswordRecoveryForm />
        ) : (
          <div className="w-full max-w-md bg-black/80 backdrop-blur-md p-8 rounded-lg border border-gray-800 shadow-2xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-netflix-accent mb-4">Password Reset Error</h1>
              <p className="text-white mb-6">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="bg-netflix-accent text-white px-6 py-2 rounded hover:bg-netflix-accent/90"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
