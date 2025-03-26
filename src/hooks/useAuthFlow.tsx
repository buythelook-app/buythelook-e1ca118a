
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
    console.log("Auth flow init started");
    let isMounted = true;

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/home');
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
      const isMobileNative = Capacitor.isNativePlatform();
      console.log("Platform check:", isMobileNative ? "mobile native" : "browser");
      
      // Check if we have auth params in the URL (hash or query)
      const hasAuthParams = window.location.hash || 
                           window.location.search.includes('code=') || 
                           window.location.search.includes('token=') ||
                           window.location.search.includes('type=');
      
      if (hasAuthParams) {
        console.log("Auth params detected in URL");
        if (!isMounted) return false;
        
        setIsLoading(true);
        
        try {
          console.log("Processing OAuth redirect/deeplink");
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            console.log("Authentication successful from redirect/deeplink");
            toast({
              title: "Success",
              description: "Authentication successful.",
            });
            navigate('/home');
            return true;
          }
          
          console.log("No session after processing redirect/deeplink");
        } catch (error: any) {
          console.error("Auth redirect/deeplink processing error:", error);
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
