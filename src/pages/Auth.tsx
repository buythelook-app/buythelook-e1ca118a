import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";

export const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-white">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Animated background elements */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-purple-500/10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <motion.div 
        className="w-full max-w-md bg-black/80 backdrop-blur-md p-8 rounded-lg border border-gray-800 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          key={isSignIn ? "signin" : "signup"}
          initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {isSignIn ? <SignInForm /> : <SignUpForm />}
        </motion.div>
        
        <SocialSignIn />
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isSignIn ? "New to Buy the Look?" : "Already have an account?"}
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="link"
              className="text-netflix-accent mt-2"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
