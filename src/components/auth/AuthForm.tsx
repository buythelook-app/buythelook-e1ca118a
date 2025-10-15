
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialSignIn } from "@/components/auth/SocialSignIn";

interface AuthFormProps {
  isSignIn: boolean;
  onToggleAuthMode: () => void;
}

export const AuthForm = ({ isSignIn, onToggleAuthMode }: AuthFormProps) => {
  return (
    <motion.div 
      className="w-full max-w-md bg-background/95 backdrop-blur-md p-8 rounded-lg border border-border shadow-lg relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Buy the Look</h1>
        <p className="text-muted-foreground">התחברו כדי להמשיך</p>
      </div>
      
      <SocialSignIn />
    </motion.div>
  );
};
