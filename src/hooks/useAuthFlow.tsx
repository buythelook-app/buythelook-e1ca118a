import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignIn, setIsSignIn] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        console.log("Checking current session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          console.log("Active session found:", data.session);
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
        setIsLoading(false);
      }
    };
    
    const processOAuthRedirect = async () => {
      // We're in a potential OAuth redirect callback
      try {
        setIsLoading(true);
        console.log("Processing potential OAuth redirect");
        
        // Exchange the OAuth token for a session (this works for browser redirects)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          console.log("OAuth authentication successful:", data.session);
          toast({
            title: "Success",
            description: "You have been signed in successfully.",
          });
          navigate('/home');
          return true;
        }
      } catch (error: any) {
        console.error("OAuth redirect processing error:", error);
        toast({
          title: "Error",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      
      return false;
    };
    
    const handleDeepLink = async () => {
      if (Capacitor.isNativePlatform()) {
        console.log("Checking for deep link params");
        // On mobile devices, handle auth from deep link
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('access_token') || urlParams.has('refresh_token') || window.location.hash) {
          console.log("Deep link detected with auth tokens");
          setIsLoading(true);
          
          try {
            // Let Supabase handle the token
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (data.session) {
              console.log("Deep link auth successful");
              toast({
                title: "Success",
                description: "Authentication successful.",
              });
              navigate('/home');
              return true;
            }
          } catch (error: any) {
            console.error("Deep link auth error:", error);
            toast({
              title: "Error",
              description: error.message || "Authentication failed",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
      
      return false;
    };
    
    // Check for auth in this order to handle all cases
    const init = async () => {
      const hasHash = window.location.hash || window.location.search.includes('type=');
      
      if (hasHash) {
        // If we have hash or OAuth params, prioritize processing them
        console.log("Hash or OAuth params detected, processing redirect");
        const processed = await processOAuthRedirect();
        if (processed) return;
        
        await handleDeepLink();
      } else {
        // Otherwise just check for an existing session
        await checkSession();
      }
    };
    
    init();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/home');
      }
    });

    return () => {
      subscription.unsubscribe();
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
