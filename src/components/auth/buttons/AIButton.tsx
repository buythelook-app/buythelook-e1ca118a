
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
      className="bg-fashion-primary text-white hover:bg-fashion-accent border-transparent"
    >
      AI-Powered Sign In
    </SocialAuthButton>
  );
};
