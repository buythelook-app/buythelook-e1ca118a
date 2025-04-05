import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAIAssisted, setIsAIAssisted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (isAIAssisted) {
      toast({
        title: "AI Profile Creation",
        description: "Creating personalized profile suggestions...",
      });
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            name: name,
          }
        }
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
        title: "Check your email",
        description: "We've sent you a confirmation link. Please check your email to verify your account before logging in.",
      });
      
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
        <h1 className="text-3xl font-bold text-netflix-accent">Create Account</h1>
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
            className="bg-black/5 text-white"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black/5 text-white"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black/5 text-white"
          />
        </div>
        <Button 
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsAIAssisted(!isAIAssisted)}
        >
          {isAIAssisted ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {isAIAssisted ? "AI Profile Creation Enabled" : "Enable AI Profile Creation"}
        </Button>
        <Button 
          type="submit" 
          className="w-full bg-netflix-accent hover:bg-netflix-accent/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};
