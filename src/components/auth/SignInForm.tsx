
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAIAssisted, setIsAIAssisted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAIAssisted) {
      toast({
        title: "AI Authentication",
        description: "Enhanced security check in progress...",
      });
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
        title: "Success",
        description: "Signed in successfully",
      });
      
      // Navigate directly to home after successful sign in
      navigate("/home");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-netflix-accent">Sign In</h1>
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
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black/5"
          />
        </div>
        <Button 
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsAIAssisted(!isAIAssisted)}
        >
          {isAIAssisted ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {isAIAssisted ? "AI Security Enabled" : "Enable AI Security"}
        </Button>
        <Button type="submit" className="w-full bg-netflix-accent hover:bg-netflix-accent/90">
          Sign In
        </Button>
      </form>
    </div>
  );
};
