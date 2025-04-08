
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Auth flow init started");
    let isMounted = true;
    let deepLinkListener: any = null;
    let retryCount = 0;
    const maxRetries = 10; // Increased max retries
    
    // Set up deep link handler for native platforms
    const setupDeepLinks = () => {
      if (Capacitor.isNativePlatform()) {
        console.log("Setting up deep link listener for mobile");
        deepLinkListener = App.addListener('appUrlOpen', async (data) => {
          console.log('Deep link received in useAuthFlow:', data.url);
          
          if (data.url.includes('auth') && isMounted) {
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
                        // We can't directly call exchangeCodeForSession here as it's not exposed
                        // Instead, we'll manually trigger a refresh and wait
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
    };
    
    setupDeepLinks();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully:", session.user?.id);
        setAuthError(null);
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/home');
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery detected");
        setIsPasswordRecovery(true);
        setIsSignIn(true);
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
    });
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        console.log("Checking current session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          throw error;
        }
        
        if (data.session) {
          console.log("Active session found", data.session.user?.id);
          navigate('/home');
          return;
        }
        
        console.log("No active session found");
      } catch (error: any) {
        console.error("Session check error:", error);
        setAuthError(error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    const handleDeepLink = async () => {
      const isMobileNative = Capacitor.isNativePlatform();
      console.log("Platform check:", isMobileNative ? "mobile native" : "browser");
      
      // Check if we have auth params in URL
      const hasAuthParams = window.location.hash || 
                           window.location.search.includes('code=') || 
                           window.location.search.includes('token=') ||
                           window.location.search.includes('type=') ||
                           window.location.search.includes('error=') ||
                           window.location.search.includes('access_token=');
      
      if (hasAuthParams) {
        console.log("Auth params detected in URL:", window.location.href);
        if (!isMounted) return false;
        
        setIsLoading(true);
        
        try {
          console.log("Processing OAuth redirect");
          
          // Wait briefly to ensure auth state is ready
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Try to exchange the auth code for a session
          const { error: sessionError } = await supabase.auth.refreshSession();
          if (sessionError) {
            console.error("Error refreshing session:", sessionError);
            // Don't throw, continue trying to get session
          }
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session:", error);
            setAuthError(error.message);
            throw error;
          }
          
          if (data.session) {
            console.log("Authentication successful from redirect, user:", data.session.user?.id);
            setAuthError(null);
            toast({
              title: "Success",
              description: "Authentication successful.",
            });
            navigate('/home');
            return true;
          }
          
          console.log("No session after processing redirect");
          
          // Check for password recovery
          const url = new URL(window.location.href);
          if (url.hash.includes('type=recovery') || 
              url.search.includes('type=recovery')) {
            console.log("Password recovery flow detected");
            setIsPasswordRecovery(true);
            setIsSignIn(true);
          }
          
          // Check for error in the URL
          if (url.search.includes('error=') || url.hash.includes('error=')) {
            console.error("Auth error in URL:", url.toString());
            setAuthError("Authentication error in URL");
            toast({
              title: "Authentication Error",
              description: "There was a problem with the authentication process. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("Auth redirect processing error:", error);
          setAuthError(error.message || "Authentication failed");
          toast({
            title: "Error",
            description: error.message || "Authentication failed",
            variant: "destructive",
          });
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
      
      return false;
    };
    
    // Initialize authentication flow
    const init = async () => {
      const handled = await handleDeepLink();
      if (!handled) {
        await checkSession();
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      
      // Clean up app listener if on native platform
      if (deepLinkListener) {
        deepLinkListener.remove();
      }
    };
  }, [navigate, toast]);

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setAuthError(null);
  };

  return {
    isLoading,
    isSignIn,
    isPasswordRecovery,
    toggleAuthMode,
    authError,
  };
};
