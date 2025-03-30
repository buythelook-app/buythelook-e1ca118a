
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          toast({
            title: "Error",
            description: "There was a problem checking your login status",
            variant: "destructive",
          });
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!data.session);
          console.log("Auth check result:", !!data.session);
        }
      } catch (err) {
        console.error("Exception during auth check:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session ? "Has session" : "No session");
        setIsAuthenticated(!!session);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);
  
  return { isAuthenticated, isLoading };
};
