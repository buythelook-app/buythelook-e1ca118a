
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logger from "@/lib/logger";

export const PasswordRecoveryForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info("Attempting to update password");
      
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        logger.error("Error updating password", {
          data: { error: error.message }
        });
        
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      logger.info("Password updated successfully");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      // Wait a moment before redirecting to show the success toast
      setTimeout(() => {
        navigate("/home");
      }, 2000);
      
    } catch (error: any) {
      logger.error("Unexpected error updating password", {
        data: { error: error.message }
      });
      
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
    <motion.div
      className="w-full max-w-md bg-black/80 backdrop-blur-md p-8 rounded-lg border border-gray-800 shadow-2xl relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-netflix-accent">Reset Password</h1>
        <p className="text-muted-foreground mt-2">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black/5 text-white pr-10"
            autoComplete="new-password"
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
        <div className="space-y-2 relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-black/5 text-white pr-10"
            autoComplete="new-password"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none" 
            onClick={toggleConfirmPasswordVisibility}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-netflix-accent hover:bg-netflix-accent/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating password..." : "Reset Password"}
        </Button>
      </form>
    </motion.div>
  );
};
