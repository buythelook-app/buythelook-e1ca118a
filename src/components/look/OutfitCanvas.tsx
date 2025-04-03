
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { type CanvasItem } from "@/types/canvasTypes";
import { ShoppingCart, Shuffle, Loader2 } from "lucide-react";

interface OutfitCanvasProps {
  canvasItems: CanvasItem[];
  isRefreshing: boolean;
  onAddToCart: () => void;
  onTryDifferent: () => void;
}

export const OutfitCanvas = ({ 
  canvasItems, 
  isRefreshing, 
  onAddToCart, 
  onTryDifferent 
}: OutfitCanvasProps) => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative w-[300px]">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-4">
          <div className="relative">
            {isRefreshing ? (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-netflix-accent" />
              </div>
            ) : null}
            <LookCanvas items={canvasItems} width={300} height={480} />
            <div className="absolute bottom-0 left-4 right-4 flex justify-between gap-2">
              <Button 
                onClick={onAddToCart}
                className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                disabled={isRefreshing}
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Buy the look
              </Button>
              <Button
                onClick={onTryDifferent}
                className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                disabled={isRefreshing}
              >
                <Shuffle className="mr-1 h-3 w-3" />
                Try different
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
