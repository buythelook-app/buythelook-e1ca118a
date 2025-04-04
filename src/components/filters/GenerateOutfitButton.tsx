
import { Button } from "../ui/button";

interface GenerateOutfitButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const GenerateOutfitButton = ({ isLoading, onClick }: GenerateOutfitButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="bg-netflix-accent hover:bg-netflix-accent/80 w-full"
      disabled={isLoading}
    >
      {isLoading ? "Generating..." : "Create Fresh Style Ideas"}
    </Button>
  );
};
