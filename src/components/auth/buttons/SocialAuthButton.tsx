
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SocialAuthButtonProps {
  isLoading: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SocialAuthButton = ({
  isLoading,
  onClick,
  icon,
  children,
  className
}: SocialAuthButtonProps) => {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </Button>
  );
};
