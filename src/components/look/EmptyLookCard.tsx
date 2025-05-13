
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyLookCardProps {
  occasion: string;
  onShuffle: (occasion: string) => void;
}

export const EmptyLookCard = ({ occasion, onShuffle }: EmptyLookCardProps) => {
  return (
    <div className="bg-netflix-card p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{occasion} Look</h3>
      </div>
      <div className="mb-4 bg-white/10 rounded-lg h-80 flex items-center justify-center">
        <div className="text-center p-4">
          <Button
            onClick={() => onShuffle(occasion)}
            className="bg-netflix-accent text-white"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Generate Look
          </Button>
        </div>
      </div>
    </div>
  );
};
