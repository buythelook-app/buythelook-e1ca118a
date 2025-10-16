
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthFlowState } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
  const [state, setState] = useState<AuthFlowState>({
    isLoading: true,
    isSignIn: true,
    authError: null
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      console.log("Auth event details:", { event, userId: session?.user?.id });
      
      if (session?.user) {
        console.log("User metadata:", JSON.stringify({
          provider: session.user.app_metadata?.provider,
          email: session.user.email,
        }));
      }
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully:", session.user?.id);
        setState(prev => ({ ...prev, authError: null }));
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setState(prev => ({ 
          ...prev, 
          authError: null,
          isLoading: false 
        }));
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery detected");
        // Now we redirect to the dedicated password recovery page
        navigate('/reset-password');
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
    });
    
    return () => {
      console.log("Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Convenience functions to update state
  const setIsLoading = (isLoading: boolean) => {
    console.log(`Setting isLoading to ${isLoading}`);
    setState(prev => ({ ...prev, isLoading }));
  };

  const setIsSignIn = (isSignIn: boolean) => {
    console.log(`Setting isSignIn to ${isSignIn}`);
    setState(prev => ({ ...prev, isSignIn }));
  };

  const setAuthError = (authError: string | null) => {
    console.log(`Setting authError to ${authError}`);
    setState(prev => ({ ...prev, authError }));
  };

  const toggleAuthMode = () => {
    console.log(`Toggling auth mode from ${state.isSignIn ? 'sign in' : 'sign up'} to ${!state.isSignIn ? 'sign in' : 'sign up'}`);
    setState(prev => ({
      ...prev,
      isSignIn: !prev.isSignIn,
      authError: null
    }));
  };

  return {
    ...state,
    toggleAuthMode,
    setIsLoading,
    setIsSignIn,
    setAuthError
  };
};
