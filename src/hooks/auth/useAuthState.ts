
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthFlowState } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
  const [state, setState] = useState<AuthFlowState>({
    isLoading: true,
    isSignIn: true,
    isPasswordRecovery: false,
    authError: null
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session");
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully:", session.user?.id);
        setState(prev => ({ ...prev, authError: null }));
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/home');
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery detected");
        setState(prev => ({ 
          ...prev, 
          isPasswordRecovery: true,
          isSignIn: true 
        }));
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Convenience functions to update state
  const setIsLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setIsSignIn = (isSignIn: boolean) => {
    setState(prev => ({ ...prev, isSignIn }));
  };

  const setIsPasswordRecovery = (isPasswordRecovery: boolean) => {
    setState(prev => ({ ...prev, isPasswordRecovery }));
  };

  const setAuthError = (authError: string | null) => {
    setState(prev => ({ ...prev, authError }));
  };

  const toggleAuthMode = () => {
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
    setIsPasswordRecovery,
    setAuthError
  };
};
