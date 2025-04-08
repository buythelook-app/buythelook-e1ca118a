
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

export type SocialProvider = "google" | "apple" | "ai";

export interface SocialAuthState {
  isLoading: {[key: string]: boolean};
  isMobile: boolean;
  authAttemptId: string | null;
}

export const useSocialAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<SocialAuthState>({
    isLoading: {
      google: false,
      apple: false,
      ai: false
    },
    isMobile: false,
    authAttemptId: null
  });

  useEffect(() => {
    // Check if running on a native mobile platform
    const isMobile = Capacitor.isNativePlatform();
    console.log("Platform check - isMobile:", isMobile);
    setAuthState(prev => ({
      ...prev,
      isMobile
    }));
    
    // Set up deep link listener for mobile platforms
    if (isMobile) {
      console.log("Setting up deep link listener in SocialSignIn for mobile");
      App.addListener('appUrlOpen', (data) => {
        console.log('Deep link received in SocialSignIn:', data.url);
        // Reset loading state when we receive the deep link
        resetLoadingState();
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        // Clean up listener when component unmounts
        App.removeAllListeners();
      }
    };
  }, []);

  // This effect will automatically reset loading state if stuck for too long
  useEffect(() => {
    const { isLoading } = authState;
    if (isLoading.google || isLoading.apple) {
      console.log(`Setting auth timeout - Google: ${isLoading.google}, Apple: ${isLoading.apple}`);
      
      const timeoutId = setTimeout(() => {
        if (isLoading.google || isLoading.apple) {
          console.log("Authentication timeout - resetting loading state after 60 seconds");
          resetLoadingState();
          
          toast({
            title: "Authentication timeout",
            description: "The authentication process took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 60000); // 1 minute timeout
      
      return () => {
        console.log("Clearing auth timeout");
        clearTimeout(timeoutId);
      };
    }
  }, [authState.isLoading, toast]);

  const resetLoadingState = () => {
    console.log("Resetting auth loading state");
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: {
        ...prev.isLoading,
        google: false, 
        apple: false 
      },
      authAttemptId: null
    }));
  };

  const setProviderLoading = (provider: SocialProvider, isLoading: boolean) => {
    console.log(`Setting ${provider} loading state to ${isLoading}`);
    
    setAuthState(prev => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [provider]: isLoading
      }
    }));
  };

  const setAuthAttemptId = (id: string | null) => {
    console.log(`Setting auth attempt ID to ${id}`);
    
    setAuthState(prev => ({
      ...prev,
      authAttemptId: id
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      // If already loading, prevent multiple attempts
      if (authState.isLoading.google) {
        console.log("Google auth already in progress, preventing multiple attempts");
        return;
      }
      
      // Generate a unique ID for this auth attempt
      const attemptId = `auth_${Date.now()}`;
      setAuthAttemptId(attemptId);
      
      setProviderLoading("google", true);
      
      // Get the current hostname for redirects
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${hostname}${port}`;
      
      // Set the redirect URL based on platform
      let redirectUrl = `${baseUrl}/auth`;
      
      // For native mobile, use app scheme
      if (authState.isMobile) {
        redirectUrl = "buythelook://auth";
        console.log(`Using mobile redirect URL: ${redirectUrl}`);
      } else {
        console.log(`Using web redirect URL: ${redirectUrl}`);
      }
      
      toast({
        title: "Starting authentication",
        description: "Connecting to Google. When prompted, select 'Buy The Look' to return to the app.",
      });
      
      console.log("Starting Google authentication flow...");
      
      // Standard Google OAuth configuration
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            }
          }
        });

        if (error) {
          console.error("Google sign-in error:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log("Google sign-in initiated:", data);
        
        if (data?.url) {
          console.log("Auth URL received:", data.url);
          
          if (!authState.isMobile) {
            // On web browsers, redirect in the current window
            console.log("Redirecting browser to:", data.url);
            window.location.href = data.url;
          } else {
            // On mobile native, we need to use the Browser plugin instead of window.open
            console.log("Opening authentication URL on mobile:", data.url);
            await Browser.open({ url: data.url });
            
            // Add additional instruction toast after a short delay
            setTimeout(() => {
              if (authState.isLoading.google) {
                toast({
                  title: "Important",
                  description: "When prompted, select 'Buy The Look' app to complete sign-in",
                });
              }
            }, 3000);
            
            // Set a timeout to reset the loading state if the deep link doesn't trigger
            setTimeout(() => {
              // Only reset if this is still the current auth attempt
              if (authState.authAttemptId === attemptId && authState.isLoading.google) {
                console.log("Authentication flow timeout - resetting state after 45 seconds");
                setProviderLoading("google", false);
                toast({
                  title: "Authentication timeout",
                  description: "Please try again or check if the app is installed correctly",
                  variant: "destructive",
                });
              }
            }, 45000); // 45 seconds timeout
          }
        } else {
          console.error("No authentication URL received from Supabase");
          throw new Error("Failed to start Google authentication");
        }
      } catch (supabaseError) {
        console.error("Supabase OAuth error:", supabaseError);
        throw supabaseError;
      }
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setProviderLoading("google", false);
      setAuthAttemptId(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (authState.isLoading.apple) {
        console.log("Apple auth already in progress");
        return;
      }
      
      const attemptId = `auth_${Date.now()}`;
      setAuthAttemptId(attemptId);
      setProviderLoading("apple", true);
      
      // Set the redirect URL based on platform
      let redirectUrl = `${window.location.origin}/auth`;
      
      // For native mobile, use app scheme
      if (authState.isMobile) {
        redirectUrl = "buythelook://auth";
        console.log(`Using mobile redirect URL: ${redirectUrl}`);
      }
      
      console.log("Starting Apple authentication flow...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error("Apple sign-in error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log("Apple sign-in initiated:", data);
      
      if (data?.url) {
        console.log("Auth URL received:", data.url);
        
        if (!authState.isMobile) {
          console.log("Redirecting browser to:", data.url);
          window.location.href = data.url;
        } else {
          console.log("Opening authentication URL on mobile:", data.url);
          await Browser.open({ url: data.url });
          
          setTimeout(() => {
            if (authState.isLoading.apple) {
              toast({
                title: "Important",
                description: "When prompted, select 'Buy The Look' app to complete sign-in",
              });
            }
          }, 3000);
          
          setTimeout(() => {
            if (authState.authAttemptId === attemptId && authState.isLoading.apple) {
              console.log("Authentication flow timeout - resetting state");
              setProviderLoading("apple", false);
              toast({
                title: "Authentication timeout",
                description: "Please try again or check if the app is installed correctly",
                variant: "destructive",
              });
            }
          }, 45000);
        }
      }
    } catch (error: any) {
      console.error("Apple sign-in failed:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Apple",
        variant: "destructive",
      });
      setProviderLoading("apple", false);
      setAuthAttemptId(null);
    }
  };

  const handleAISignIn = () => {
    setProviderLoading("ai", true);
    
    console.log("AI sign in initiated (feature coming soon)");
    
    toast({
      title: "AI Sign In",
      description: "This feature is coming soon!",
    });
    
    setTimeout(() => {
      setProviderLoading("ai", false);
    }, 1000);
  };

  return {
    authState,
    handleGoogleSignIn,
    handleAppleSignIn,
    handleAISignIn
  };
};
