
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface EmptyLookCardProps {
  occasion: string;
  onShuffle: () => void;
}

export const EmptyLookCard = ({ occasion, onShuffle }: EmptyLookCardProps) => {
  return (
    <div className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{occasion} Look</h3>
        <span className="text-sm text-netflix-accent">{occasion}</span>
      </div>
      <AspectRatio ratio={3/4} className="mb-4 bg-white/10 rounded-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center p-8 h-full">
          <p className="text-gray-500 mb-6 text-center">Generating your personalized look...</p>
          <Button 
            onClick={onShuffle}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Generate Look
          </Button>
        </div>
      </AspectRatio>
      <div className="flex justify-between items-center">
        <p className="text-netflix-accent font-semibold">$29.99</p>
        <div className="opacity-50">
          <Button disabled variant="outline" className="text-sm">
            Coming soon
          </Button>
        </div>
      </div>
    </div>
  );
};
