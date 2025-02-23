
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialSignIn } from "@/components/auth/SocialSignIn";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/80 p-8 rounded-lg border border-gray-800">
        {isSignIn ? <SignInForm /> : <SignUpForm />}
        <SocialSignIn />
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isSignIn ? "New to Buy the Look?" : "Already have an account?"}
          </p>
          <Button
            variant="link"
            className="text-netflix-accent mt-2"
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
};
