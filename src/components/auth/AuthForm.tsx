
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
      className="w-full max-w-md bg-black/80 backdrop-blur-md p-8 rounded-lg border border-gray-800 shadow-2xl relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        key={isSignIn ? "signin" : "signup"}
        initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
        transition={{ duration: 0.3 }}
      >
        {isSignIn ? <SignInForm /> : <SignUpForm />}
      </motion.div>
      
      <SocialSignIn />
      
      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          {isSignIn ? "New to Buy the Look?" : "Already have an account?"}
        </p>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="link"
            className="text-netflix-accent mt-2"
            onClick={onToggleAuthMode}
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
