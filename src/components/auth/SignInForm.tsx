
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Sign in attempt for:', email);
    setIsSubmitting(true);

    try {
      console.log('🔵 Calling signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔵 Sign in response:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        userId: data.user?.id,
        error: error?.message 
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not verified",
            description: "Please check your email and click the confirmation link before logging in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.session && data.user) {
        console.log('✅ Sign in successful! Full session data:', {
          userId: data.user.id,
          email: data.user.email,
          accessToken: data.session.access_token ? 'present' : 'missing',
          refreshToken: data.session.refresh_token ? 'present' : 'missing',
          expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString()
        });
        
        // Check localStorage immediately
        const storageKey = 'fashion-app-auth';
        const storedAuth = localStorage.getItem(`sb-aqkeprwxxsryropnhfvm-auth-token`);
        console.log('💾 LocalStorage check:', {
          storageKey,
          hasData: !!storedAuth,
          dataLength: storedAuth?.length
        });
        
        // Verify session is actually stored by getting it back
        const { data: verifyData, error: verifyError } = await supabase.auth.getSession();
        console.log('🔍 Session verification:', {
          hasSession: !!verifyData.session,
          sameUser: verifyData.session?.user?.id === data.user.id,
          error: verifyError?.message
        });
        
        if (!verifyData.session) {
          console.error('❌ Session not found after sign in!');
          toast({
            title: "Session Error",
            description: "Session was not saved. Please try again or contact support.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        
        // Use navigate instead of window.location to preserve session
        console.log('🔄 Navigating to home...');
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        console.error('❌ No session created after sign in');
        toast({
          title: "Error",
          description: "Failed to create session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Unexpected error during sign in:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setIsRecoveringPassword(true);

    try {
      // Important: Use the correct full URL for the reset link
      const resetUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
      console.log("Reset URL:", resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRecoveringPassword(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fashion-primary">Sign In</h1>
        <p className="text-muted-foreground mt-2">Welcome back to Buy the Look</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black/5"
          />
        </div>
        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black/5 pr-10"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none" 
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-fashion-primary hover:bg-fashion-accent"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          variant="link"
          size="sm"
          className="text-fashion-primary"
          onClick={handleForgotPassword}
          disabled={isRecoveringPassword}
        >
          {isRecoveringPassword ? "Sending reset email..." : "Forgot Password?"}
        </Button>
      </div>
    </div>
  );
};
