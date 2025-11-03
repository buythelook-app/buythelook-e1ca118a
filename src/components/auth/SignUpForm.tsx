
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 SignUp form submitted', { email, name, passwordLength: password.length });
    setIsSubmitting(true);
    
    // Randomly assign A/B variant (50/50 split)
    const variant = Math.random() < 0.5 ? 'A' : 'B';

    try {
      console.log('🔵 Calling Supabase signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name,
            pricing_variant: variant,
          }
        }
      });
      
      // Update profile with variant and initial credits
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ 
            pricing_variant: variant,
            user_credits: 3 
          })
          .eq('id', data.user.id);
        
        // Log analytics for A/B test assignment
        await supabase.from('analytics_events').insert({
          user_id: data.user.id,
          event: 'user_variant_assigned',
          properties: { variant },
        });
      }

      console.log('🔵 SignUp response:', { data, error });

      if (error) {
        console.error('❌ SignUp error:', error);
        
        // Handle specific error cases
        if (error.message.includes('already registered') || error.code === 'user_already_exists') {
          toast({
            title: "User already exists",
            description: "This email is already registered. Please sign in instead.",
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

      console.log('✅ SignUp successful! User data:', data);
      
      // Check if email confirmation is disabled
      if (data.user && data.session) {
        console.log('🎉 User has active session, redirecting to home');
        toast({
          title: "Welcome!",
          description: "Account created successfully.",
        });
        // Redirect to home
        window.location.href = '/';
      } else {
        console.log('📧 Email confirmation required');
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email to verify your account.",
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fashion-primary">Create Account</h1>
        <p className="text-muted-foreground mt-2">Join Buy the Look today</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-black/5"
          />
        </div>
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
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};
