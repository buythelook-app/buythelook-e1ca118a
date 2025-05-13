
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { memo } from "react";

interface EmptyLookCardProps {
  occasion: string;
  onShuffle: () => void;
  isLoading?: boolean;
}

export const EmptyLookCard = memo(({ occasion, onShuffle, isLoading = false }: EmptyLookCardProps) => {
  // Prevent shuffle button action during loading
  const handleShuffle = (e: React.MouseEvent) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    onShuffle();
  };
  
  return (
    <div className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{occasion} Look</h3>
        <span className="text-sm text-netflix-accent">{occasion}</span>
      </div>
      <AspectRatio ratio={3/4} className="mb-4 bg-white/10 rounded-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center p-8 h-full">
          <p className="text-gray-500 mb-6 text-center">
            {isLoading 
              ? "Creating your personalized look..." 
              : "Generate a look that matches your style"}
          </p>
          <Button 
            onClick={handleShuffle}
            variant="outline" 
            className={`flex items-center gap-2 ${isLoading ? 'pointer-events-none' : ''}`}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Creating..." : "Generate Look"}
          </Button>
        </div>
      </AspectRatio>
      <div className="flex justify-between items-center">
        <p className="text-netflix-accent font-semibold">$29.99</p>
        <div className={isLoading ? "opacity-50" : ""}>
          <Button disabled={isLoading} variant="outline" className="text-sm">
            {isLoading ? "Loading..." : "Coming soon"}
          </Button>
        </div>
      </div>
    </div>
  );
});

EmptyLookCard.displayName = "EmptyLookCard";
