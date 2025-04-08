
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface AIButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const AIButton = ({ isLoading, onClick }: AIButtonProps) => {
  return (
    <Button 
      variant="outline" 
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-transparent"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      ) : (
        <Bot className="mr-2 h-4 w-4" />
      )}
      AI-Powered Sign In
    </Button>
  );
};
