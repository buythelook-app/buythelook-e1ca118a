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
    
    // Set up global deep link listener
    console.log("Setting up global deep link listener");
    if (!window.Capacitor?.isNativePlatform?.()) {
      console.log("Not running on native platform, skipping app URL listener");
    }

    // Enhanced auth state change listener
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
          
          try {
            // Let Supabase process the URL parameters
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (data.session) {
              console.log("Session established after redirect");
              navigate('/home');
              return;
            }
            
            console.log("No session after processing URL parameters, waiting for auth state change");
            // Keep loading while we wait for the auth state change event
            setTimeout(() => {
              if (isMounted) {
                setIsLoading(false);
              }
            }, 2000);
          } catch (error) {
            console.error("Error processing auth params:", error);
            setIsLoading(false);
            toast({
              title: "Authentication Error",
              description: error.message || "Failed to process authentication",
              variant: "destructive",
            });
          }
          
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
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive",
        });
      }
    };
    
    // Run initial auth check
    checkAuthState();
    
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
