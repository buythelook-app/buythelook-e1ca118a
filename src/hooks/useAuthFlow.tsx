
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
        appUrlListener = window.App.addListener('appUrlOpen', async (data: { url: string }) => {
          console.log('Deep link received in useAuthFlow:', data.url);
          
          if ((data.url.includes('auth') || data.url.includes('callback')) && isMounted) {
            setIsLoading(true);
            
            try {
              // Process the URL to handle the authentication
              if (data.url.includes('google') || data.url.includes('token=') || data.url.includes('code=')) {
                console.log('OAuth callback detected, handling authentication');
                
                // Allow a brief moment for the OAuth process to complete
                setTimeout(async () => {
                  // Verify session after receiving the callback
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
                }, 500);
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

    // Enhanced auth state change listener - simplified
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
      }
    });
    
    // Check for existing session and auth parameters in URL
    const checkAuthState = async () => {
      if (!isMounted) return;
      
      try {
        // Process URL parameters if present (for browser-based auth redirects)
        const hasAuthParams = window.location.hash || 
                            window.location.search.includes('code=') || 
                            window.location.search.includes('token=');
        
        if (hasAuthParams) {
          console.log("Auth parameters detected in URL");
          setIsLoading(true);
          
          // Small delay to allow auth state to settle
          setTimeout(async () => {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (data.session) {
              console.log("Session established after redirect");
              navigate('/home');
              return;
            }
            
            console.log("No session after processing URL parameters");
            setIsLoading(false);
          }, 500);
          
          return;
        }
        
        // Check if user is already logged in
        console.log("Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          console.log("Active session found, navigating to home");
          navigate('/home');
          return;
        }
        
        console.log("No active session found");
        setIsLoading(false);
      } catch (error: any) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    };
    
    // Run initial auth check
    checkAuthState();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      
      if (appUrlListener) {
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
