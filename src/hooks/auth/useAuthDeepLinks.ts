
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface UseAuthDeepLinksProps {
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  setIsSignIn: (isSignIn: boolean) => void;
}

export const useAuthDeepLinks = ({
  setIsLoading,
  setAuthError,
  setIsPasswordRecovery,
  setIsSignIn,
}: UseAuthDeepLinksProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up deep link listener for auth");
    let deepLinkListener: any = null;
    
    // Set up deep link handler for native platforms
    if (Capacitor.isNativePlatform()) {
      console.log("Setting up deep link listener for mobile");
      deepLinkListener = App.addListener('appUrlOpen', async (data) => {
        console.log('Deep link received in useAuthFlow:', data.url);
        
        if (data.url.includes('auth')) {
          setIsLoading(true);
          toast({
            title: "Processing",
            description: "Completing authentication...",
          });
          
          try {
            // Process any auth params in the URL if present
            if (data.url.includes('code=') || data.url.includes('token=')) {
              // Extract the URL parameters
              const url = new URL(data.url);
              const params = new URLSearchParams(url.search);
              const hash = url.hash ? new URLSearchParams(url.hash.substring(1)) : null;
              
              console.log("Processing auth params from deep link URL");
              console.log("URL params:", Array.from(params.entries()));
              if (hash) console.log("Hash params:", Array.from(hash.entries()));
            }
            
            // Wait to ensure auth state is updated
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            // Verify session status
            const maxRetries = 10;
            let sessionData = await supabase.auth.getSession();
            console.log("Initial session check:", sessionData.data.session ? "Found session" : "No session found");
            
            // Retry session check if no session found
            let currentRetry = 0;
            const checkSessionWithRetry = async () => {
              if (!sessionData.data.session && currentRetry < maxRetries) {
                console.log(`Retry attempt ${currentRetry + 1}/${maxRetries}`);
                
                toast({
                  title: "Verifying",
                  description: `Checking authentication status (${currentRetry + 1}/${maxRetries})...`,
                });
                
                // Try to manually exchange the token if possible
                try {
                  if (data.url.includes('code=')) {
                    const url = new URL(data.url);
                    const params = url.searchParams || new URLSearchParams(url.search);
                    const code = params.get('code');
                    
                    if (code) {
                      console.log("Attempting to exchange auth code manually");
                      await supabase.auth.refreshSession();
                    }
                  }
                } catch (e) {
                  console.error("Error during manual code exchange:", e);
                }
                
                // Wait and try again
                await new Promise((resolve) => setTimeout(resolve, 2000));
                sessionData = await supabase.auth.getSession();
                console.log(`Retry ${currentRetry + 1}: ${sessionData.data.session ? "Found session" : "No session found"}`);
                currentRetry++;
                
                if (!sessionData.data.session && currentRetry < maxRetries) {
                  return checkSessionWithRetry();
                } else {
                  return sessionData;
                }
              }
              return sessionData;
            };
            
            sessionData = await checkSessionWithRetry();
            
            if (sessionData.data.session) {
              console.log("Session found after deep link:", sessionData.data.session.user?.id);
              toast({
                title: "Success",
                description: "You have been signed in successfully.",
              });
              navigate('/home');
            } else {
              console.log("No session after deep link and retries");
              
              // Try a direct sign in with the provider
              try {
                if (data.url.includes('google')) {
                  setAuthError("Authentication process was interrupted. Please try signing in again.");
                  toast({
                    title: "Authentication Incomplete",
                    description: "The Google sign-in process was interrupted. Please try again.",
                    variant: "destructive",
                  });
                } else {
                  setAuthError("Authentication failed. Please try again.");
                  toast({
                    title: "Authentication Failed",
                    description: "Please try signing in again.",
                    variant: "destructive",
                  });
                }
              } catch (providerError: any) {
                console.error("Provider sign-in error:", providerError);
              }
              
              setIsLoading(false);
            }
          } catch (error: any) {
            console.error("Deep link auth error:", error);
            setAuthError(error.message || "Authentication failed");
            toast({
              title: "Error",
              description: error.message || "Authentication failed",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        }
      });
      
      console.log("Deep link listener set up successfully");
    }

    return () => {
      // Clean up app listener if on native platform
      if (deepLinkListener) {
        deepLinkListener.remove();
      }
    };
  }, [navigate, toast, setIsLoading, setAuthError, setIsPasswordRecovery, setIsSignIn]);
};
