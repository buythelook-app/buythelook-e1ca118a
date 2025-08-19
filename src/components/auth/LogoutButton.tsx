import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logger from "@/lib/logger";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const LogoutButton = ({ 
  className = "", 
  variant = "outline", 
  size = "default" 
}: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      logger.info("Logout initiated", {
        data: {
          timestamp: new Date().toISOString()
        }
      });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error("Logout error:", {
          context: "Logout process",
          data: {
            errorMessage: error.message,
            errorCode: error.status
          }
        });
        throw error;
      }
      
      logger.info("Logout successful", {
        data: {
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
        variant: "default",
      });
      
      navigate('/auth');
    } catch (error: any) {
      logger.error("Logout failed:", {
        context: "Logout process",
        data: {
          errorMessage: error.message,
          stack: error.stack
        }
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
};