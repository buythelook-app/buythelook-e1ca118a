
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
      <div className="mb-4 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-6">No outfit recommendations available</p>
          <Button 
            onClick={onShuffle}
            variant="outline" 
            className="mx-auto flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Look
          </Button>
        </div>
      </div>
    </div>
  );
};
