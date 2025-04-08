import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export const SocialSignIn = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    google: false,
    apple: false,
    ai: false
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running on a native mobile platform
    setIsMobile(Capacitor.isNativePlatform());
    
    // Set up deep link listener for mobile platforms
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', (data) => {
        console.log('Deep link received in SocialSignIn:', data.url);
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      
      // Get the current hostname for redirects
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${hostname}${port}`;
      
      // Set the redirect URL based on platform
      let redirectUrl = `${baseUrl}/auth`;
      
      // For native mobile, use app scheme
      if (isMobile) {
        redirectUrl = "buythelook://auth";
      }
      
      console.log(`Starting Google sign-in with redirect URL: ${redirectUrl}`);
      
      toast({
        title: "Redirecting",
        description: "Opening Google sign-in...",
      });
      
      // Standard Google OAuth configuration
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        console.error("Google sign-in error:", error);
        throw error;
      }
      
      console.log("Google sign-in initiated:", data);
      
      if (data?.url) {
        // On web browsers, use window.location for a full page redirect instead of opening in a new tab
        if (!isMobile) {
          window.location.href = data.url;
        } else {
          // On mobile native, we need to open the URL in the system browser
          console.log("Opening authentication URL on mobile:", data.url);
          // Use a slight delay to ensure the toast is visible before redirect
          setTimeout(() => {
            window.open(data.url, '_system');
          }, 300);
        }
      }
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      // Leave loading state on until redirect occurs or error is shown
      // It will be reset when the page reloads after authentication
      setTimeout(() => {
        setIsLoading(prev => ({ ...prev, google: false }));
      }, 5000); // Set a maximum timeout just in case
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Apple",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, apple: false }));
    }
  };

  const handleAISignIn = () => {
    setIsLoading(prev => ({ ...prev, ai: true }));
    toast({
      title: "AI Sign In",
      description: "This feature is coming soon!",
    });
    setTimeout(() => {
      setIsLoading(prev => ({ ...prev, ai: false }));
    }, 1000);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid gap-3">
        <Button 
          variant="outline" 
          className="bg-white text-black hover:bg-gray-100 border-gray-300"
          onClick={handleGoogleSignIn}
          disabled={isLoading.google}
        >
          {isLoading.google ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-800 border-t-transparent"></span>
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-black text-white hover:bg-gray-900 border-gray-700"
          onClick={handleAppleSignIn}
          disabled={isLoading.apple}
        >
          {isLoading.apple ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
          )}
          Continue with Apple
        </Button>

        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-transparent"
          onClick={handleAISignIn}
          disabled={isLoading.ai}
        >
          {isLoading.ai ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          AI-Powered Sign In
        </Button>
      </div>
    </div>
  );
};
