import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignIn, setIsSignIn] = useState(true);

  useEffect(() => {
    console.log("Auth flow init started");
    let isMounted = true;
    let appUrlListener: { remove: () => void } | null = null;
    
    // Set up deep link handler for native platforms
    if (window.Capacitor?.isNativePlatform?.()) {
      console.log("Setting up deep link handler on native platform");
      
      // Only set up listener if App is available
      if (window.App?.addListener) {
        appUrlListener = window.App.addListener('appUrlOpen', async (data) => {
          console.log('Deep link received in useAuthFlow:', data.url);
          
          if (data.url.includes('auth') && isMounted) {
            setIsLoading(true);
            
            try {
              // After deep link is received, verify session
              const { data: sessionData, error } = await supabase.auth.getSession();
              
              if (error) throw error;
              
              if (sessionData.session) {
                console.log("Session found after deep link:", sessionData.session.user?.id);
                toast({
                  title: "Success",
                  description: "You have been signed in successfully.",
                });
                navigate('/home');
              } else {
                console.log("No session after deep link");
                setIsLoading(false);
              }
            } catch (error: any) {
              console.error("Deep link auth error:", error);
              toast({
                title: "Error",
                description: error.message || "Authentication failed",
                variant: "destructive",
              });
              setIsLoading(false);
            }
          }
        });
      } else {
        console.warn("window.App.addListener not available");
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully:", session.user?.id);
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/home');
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      }
    });
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        console.log("Checking current session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          console.log("Active session found", data.session.user?.id);
          toast({
            title: "Success",
            description: "You are signed in.",
          });
          navigate('/home');
          return;
        }
        
        console.log("No active session found");
      } catch (error: any) {
        console.error("Session check error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    const handleDeepLink = async () => {
      const isMobileNative = window.Capacitor?.isNativePlatform?.() || false;
      console.log("Platform check:", isMobileNative ? "mobile native" : "browser");
      
      // Check if we have auth params in URL
      const hasAuthParams = window.location.hash || 
                           window.location.search.includes('code=') || 
                           window.location.search.includes('token=') ||
                           window.location.search.includes('type=') ||
                           window.location.search.includes('access_token=');
      
      if (hasAuthParams) {
        console.log("Auth params detected in URL:", window.location.href);
        if (!isMounted) return false;
        
        setIsLoading(true);
        
        try {
          console.log("Processing OAuth redirect");
          // Try to exchange the auth code for a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            console.log("Authentication successful from redirect, user:", data.session.user?.id);
            toast({
              title: "Success",
              description: "Authentication successful.",
            });
            navigate('/home');
            return true;
          }
          
          console.log("No session after processing redirect");
        } catch (error: any) {
          console.error("Auth redirect processing error:", error);
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
      if (window.Capacitor?.isNativePlatform?.() && window.App?.removeAllListeners) {
        window.App.removeAllListeners();
      } else if (appUrlListener) {
        // If we have a listener reference, remove it directly
        appUrlListener.remove();
      }
    };
  }, [navigate, toast]);

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
  };

  return {
    isLoading,
    isSignIn,
    toggleAuthMode,
  };
};
