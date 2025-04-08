
import { Bot } from "lucide-react";
import { SocialAuthButton } from "./SocialAuthButton";

interface AIButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const AIButton = ({ isLoading, onClick }: AIButtonProps) => {
  return (
    <SocialAuthButton
      isLoading={isLoading}
      onClick={onClick}
      icon={<Bot className="mr-2 h-4 w-4" />}
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-transparent"
    >
      AI-Powered Sign In
    </SocialAuthButton>
  );
};
