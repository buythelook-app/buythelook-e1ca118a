
import React from "react";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";

export const Auth = () => {
  const { isLoading, isSignIn, toggleAuthMode } = useAuthFlow();

  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />
      <AuthForm isSignIn={isSignIn} onToggleAuthMode={toggleAuthMode} />
    </div>
  );
};
