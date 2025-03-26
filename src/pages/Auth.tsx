
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
    // Check if user is already authenticated
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          console.log("User already authenticated:", data.session);
          toast({
            title: "Success",
            description: "You have been signed in successfully.",
          });
          navigate('/home');
        }
      } catch (error: any) {
        console.error("Authentication error:", error);
        toast({
          title: "Error",
          description: error.message || "Authentication error",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check for deep link handling on mobile
    const checkDeepLink = async () => {
      if (Capacitor.isNativePlatform()) {
        // On mobile devices, check URL parameters from deep links
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('access_token') || urlParams.has('refresh_token')) {
          console.log("Deep link detected with auth tokens");
          // Process the tokens through Supabase's Auth API
          try {
            setIsLoading(true);
            // Let Supabase handle the token exchange
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (data.session) {
              console.log("Successfully authenticated via deep link");
              toast({
                title: "Success",
                description: "You have been signed in successfully.",
              });
              navigate('/home');
            }
          } catch (error: any) {
            console.error("Deep link auth error:", error);
            toast({
              title: "Error",
              description: error.message || "Authentication error",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
    };
    
    // Check URL parameters for hash fragment from OAuth providers
    const checkHashParams = async () => {
      console.log("Checking for hash params. Location:", location);
      console.log("Hash:", window.location.hash);
      console.log("Search:", window.location.search);
      
      // If URL contains a hash fragment or search params, it might be a redirect from OAuth provider
      if (window.location.hash || window.location.search) {
        console.log("Hash or search params detected:", window.location.hash || window.location.search);
        setIsLoading(true);
        
        try {
          // Exchange the OAuth token for a session
          const { data, error } = await supabase.auth.getSession();
          console.log("Session after hash check:", data);
          
          if (error) throw error;
          
          if (data.session) {
            console.log("OAuth authentication successful:", data.session);
            const authEvent = new URLSearchParams(window.location.search).get('event');
            let message = "You have been signed in successfully.";
            
            if (authEvent === 'signup') {
              message = "Your account has been created and you are now signed in.";
            }
            
            toast({
              title: "Success",
              description: message,
            });
            navigate('/home');
          } else {
            console.log("No session found after OAuth redirect");
          }
        } catch (error: any) {
          console.error("OAuth error:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to complete authentication",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    checkHashParams();
    checkDeepLink(); // Add deep link handling for mobile

    // Listen for auth state changes
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
  }, [navigate, toast, location]);

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
