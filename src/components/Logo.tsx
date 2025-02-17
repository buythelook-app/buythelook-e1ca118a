
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizes = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/lovable-uploads/49120b89-0825-4ee5-b58f-9afadf263a51.png"
        alt="Buy the Look Logo"
        className={cn("mr-2", sizes[size])}
      />
    </div>
  );
};
